const AWS = require('aws-sdk');
const { v4: uuid } =require('uuid');

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'todo';
const INDEX_NAME = 'userId-_id-index';

exports.todo_get_all = async (req, res, next) => {
    const params = {
        TableName: TABLE_NAME
    };
    const todos = await dynamoClient.scan(params).promise();
    res.status(200).json({
        result: todos
    });
};

exports.todo_get_by_id = async (req, res, next) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            _id: req.params.id,
            userId: req.body.userId
        }
    };
    const todo = await dynamoClient.get(params).promise();
    res.status(200).json({
        result: todo
    });
};

exports.todo_get_by_userId = async (req, res, next) => {
    const params = {
        TableName: TABLE_NAME,
        IndexName: INDEX_NAME,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {':userId': req.params.id}
    };
    const todo = await dynamoClient.query(params).promise();
    res.status(200).json({
        result: todo
    });
};

exports.todo_create = async (req, res, next) => {
    const id = uuid();
    const params = {
        TableName: TABLE_NAME,
        Item: {
            _id: id,
            isDone: false,
            isStarred: false,
            task: req.body.task,
            userId: req.body.userId
        }
    };
    await dynamoClient.put(params).promise();
    res.status(201).json({
        _id: id
    });
};

exports.todo_update = async (req, res, next) => {
    console.log(keys);
    const params = {
        TableName: TABLE_NAME,
        Key: {
            _id: req.params.id,
            userId: req.body.userId
        },
        UpdateExpression: 'set #a = :b',
        ExpressionAttributeNames: {'#a' : keys[1]},
        ExpressionAttributeValues: {':b' : req.body[keys[1]]}
    };
    await dynamoClient.update(params).promise();
    res.status(200).json({
        _id: req.body._id
    });
};

exports.todo_delete = async (req, res, next) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            _id: req.params.id
        }
    };
    await dynamoClient.delete(params).promise();
    res.status(200).json({
        message: 'product deleted'
    });
};