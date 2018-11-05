import { DynamoDB } from 'aws-sdk';
import { GraphQLServerLambda } from 'graphql-yoga';
import path from 'path';
import resolvers from './resolvers';

const offlineDynamoConfig = { region: 'localhost', endpoint: 'http://127.0.0.1:8000' };
const db = new DynamoDB.DocumentClient(process.env.IS_OFFLINE ? offlineDynamoConfig : {});

const todosTable = (op, opConfig = {}) => {
	return new Promise((resolve, reject) => {
		db[op]({ TableName: process.env.TABLE_NAME, ...opConfig }, (error, data) => {
			if (error) {
				reject(error);
			} else {
				resolve(data);
			}
		});
	});
};

let lambda;
try {
	lambda = new GraphQLServerLambda({
		typeDefs: path.resolve(__dirname, './schema.graphql'),
		resolvers,
		context: (prevContext) => ({ ...prevContext, todosTable }),
	});
} catch (error) {
	throw new Error(error);
}

export default {
	server: lambda.graphqlHandler,
	playground: lambda.playgroundHandler,
};
