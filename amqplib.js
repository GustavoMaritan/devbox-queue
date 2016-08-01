var amqp = require('amqplib'),
    waterfall = require('async-waterfall'),
    model = {};

module.exports = function (options) {
    if (options === undefined) {
        console.error('Definir parâmetro -> options de config amqp');
        process.exit(-1);
        return null;
    }

    model = options;
    return {
        publisher: publisher(model.queueName),
        listener: listener(model.queueName)
    };
};

function publisher(queueName) {
    return function (message, onMessageSended) {
        initialize(queueName, function (conn, channel) {
            channel.sendToQueue(queueName, new Buffer(JSON.stringify(message)), { persistent: model.persistent || false });
            onMessageSended && onMessageSended();
        });
    };
}

function listener(queueName) {
    return function (onMessageReceived) {
        initialize(queueName, function (conn, channel) {
            channel.consume(queueName, function (message) {
                if (message !== null) {
                    onMessageReceived(JSON.parse(message.content), function () {
                        channel.ack(message);
                    });
                }
                else
                    channel.ack(message);
            });
        });
    };
}

function initialize(queueName, callback) {
    waterfall([
        connectToQueue(queueName),
        createChanell,
        assertQueue
    ],
        function (err, conn, channel) {
            if (err) {
                model.log ? model.log(model.logCollectionName !== null ? model.logCollectionName : 'QueueConnectionError', err)
                    : console.log('QueueConnectionError', err);
            }
            else
                callback(conn, channel);
        });
}

function connectToQueue(queueName) {
    return function (callback) {
        var connectionOk = amqp.connect(model.uri);
        connectionOk.then(
            function (conn) {
                callback(null, queueName, conn);
            },
            function (err) {
                callback({
                    meta: {
                        date: new Date(),
                        queueName: queueName,
                        caller: model.caller,
                        errorInfo: {
                            developerInfo: 'Ocorreu um erro ao abrir a conexão com a fila',
                            functionName: 'connectToQueue',
                            fileName: 'amqp.module'
                        }
                    },
                    body: err
                });
            });
    };
}

function createChanell(queueName, conn, callback) {
    var queueChanell = conn.createChannel();
    queueChanell.then(
        function (channel) {
            callback(null, queueName, conn, channel);
        },
        function (err) {
            callback({
                meta: {
                    date: new Date(),
                    queueName: queueName,
                    caller: model.caller,
                    errorInfo: {
                        developerInfo: 'Ocorreu um erro ao abrir o canal com a fila',
                        functionName: 'createChanell',
                        fileName: 'amqp.module'
                    }
                },
                body: err
            });
        });
}

function assertQueue(queueName, conn, channel, callback) {
    channelOk = channel.assertQueue(queueName);
    channelOk.then(function () {
        callback(null, conn, channel);
    },
        function (err) {
            callback({
                meta: {
                    date: new Date(),
                    queueName: queueName,
                    caller: model.caller,
                    errorInfo: {
                        developerInfo: 'Ocorreu um erro ao fazer assert da fila',
                        functionName: 'assertQueue',
                        fileName: 'amqp.module'
                    }
                },
                body: err
            });
        });
}