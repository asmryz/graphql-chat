const { GraphQLServer, PubSub } = require('graphql-yoga');

const messages = [];

const typeDefs = `
    type Message{
        id: ID!
        user: String!
        content: String!
    }

    type Query{
        messages: [Message!]
    }

    type Mutation{
        postMessage(user: String!, content: String!): ID!
    }

    type Subscription{
        messagePosted: Message
    }
`;

const resolvers = {
    Query: {
        messages: () => messages,
    },
    Mutation: {
        postMessage: (parent, { user, content }) => {
            const id = messages.length
            messages.push({ id, user, content });

            pubsub.publish('POST_MESSAGE', {
                messagePosted: { id, user, content }
            });

            return id;
        },
    },
    Subscription: {
        messagePosted: {
            subscribe: (parent, args, { pubsub }) =>  pubsub.asyncIterator('POST_MESSAGE')
        }
    }
}
const pubsub = new PubSub()
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });

server.start(({ port }) => console.log(`Server on http://localhost:${port}/`))

