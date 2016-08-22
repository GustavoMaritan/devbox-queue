##DEVBOX-QUEUE

Gerenciar queue Rabbitmq.

- publisher
- listener

## Object config
```
var config = {
    queueName: 'queueName',
    uri: path-queue,
    log: function,
    logCollectionName: 'name collection log',
    caller: 'name queue user',
    persistent: true or false "default false"
}
```

## Formato entrada
```
var objQueue = {
    meta : {},
    body : {}
}
```

## listener
```
amqp = require('devbox-queue')(config);

amqp.listener(function (message, removeFromQueue) {
    console.log(message);
    removeFromQueue();
});

```

## publisher
```
amqp = require('devbox-queue')(config);

amqp.publisher(objQueue, function (err, data){

});
```