import { GraphQLError } from 'graphql';
import { v4 as uuid } from 'uuid';

export default {
	Query: {
		todos: async (object, variables, { todosTable }) => {
			const result = await todosTable('scan');
			return result.Items;
		},
		todo: async (object, { id }, { todosTable }) => {
			const result = await todosTable('get', { Key: { id } });
			if (!result.Item) {
				throw new GraphQLError('Not found');
			}
			return result.Item;
		},
	},
	Mutation: {
		createTodo: async (object, { input }, { todosTable }) => {
			const id = uuid();
			await todosTable('put', {
				Item: { ...input, id },
				ReturnValues: 'ALL_OLD',
			});
			const result = await todosTable('get', {
				Key: { id },
			});
			return result.Item;
		},
		updateTodo: async (object, { id, input }, { todosTable }) => {
			await todosTable('put', {
				Item: { ...input, id },
				ReturnValues: 'ALL_OLD',
			});
			const result = await todosTable('get', {
				Key: { id },
			});
			return result.Item;
		},
		deleteTodo: async (object, { id }, { todosTable }) => {
			const result = await todosTable('get', {
				Key: { id },
			});
			await todosTable('delete', {
				Key: { id },
				ReturnValues: 'ALL_OLD',
			});
			return result.Item;
		},
	},
};
