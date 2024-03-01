import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  createGqlResponseSchema,
  gqlResponseSchema,
  memberType,
  memberTypeIdEnum,
  postType,
} from './schemas.js';
import {
  graphql,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const userType = new GraphQLObjectType({
    name: 'User',
    description: 'The user representation in the database',
    fields: () => ({
      id: {
        type: UUIDType,
        description: 'The id of the user',
      },
      name: {
        type: GraphQLString,
        description: 'The name of the user',
      },
      balance: {
        type: GraphQLFloat,
        description: 'The current balance of the user',
      },
      profile: {
        type: profileType as GraphQLObjectType,
        args: { id: { type: UUIDType } },
        resolve: async (parent: { id: string }) => {
          return prisma.profile.findUnique({
            where: {
              userId: parent.id,
            },
          });
        },
      },
      posts: {
        type: new GraphQLList(postType),
        resolve: async (parent: { id: string }) => {
          return prisma.post.findMany({
            where: {
              authorId: parent.id,
            },
          });
        },
      },
      userSubscribedTo: {
        type: new GraphQLList(userType),
        resolve: async (parent: { id: string }) => {
          return prisma.user.findMany({
            where: {
              subscribedToUser: {
                some: {
                  subscriberId: parent.id,
                },
              },
            },
          });
        },
      },
      subscribedToUser: {
        type: new GraphQLList(userType),
        resolve: async (parent: { id: string }) => {
          return prisma.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: parent.id,
                },
              },
            },
          });
        },
      },
    }),
  });

  const profileType = new GraphQLObjectType({
    name: 'Profile',
    description: 'The profile representation in the database',
    fields: {
      id: {
        type: UUIDType,
        description: 'The profile id',
      },
      isMale: {
        type: GraphQLBoolean,
        description: 'The field that represents profile is male or not',
      },
      yearOfBirth: {
        type: GraphQLInt,
        description: 'The profiles year of birth',
      },
      user: {
        type: userType as GraphQLObjectType,
        args: { id: { type: UUIDType } },
        resolve: async (_parent, args: { id: string }) => {
          return prisma.user.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      userId: {
        type: UUIDType,
      },
      memberType: {
        type: memberType,
        args: { id: { type: UUIDType } },
        resolve: async (parent: { memberTypeId: MemberTypeId }) => {
          return prisma.memberType.findUnique({
            where: {
              id: parent.memberTypeId,
            },
          });
        },
      },
      memberTypeId: {
        type: memberTypeIdEnum,
      },
    },
  });

  // QUERIES
  const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: new GraphQLList(userType),
        resolve: async () => {
          return prisma.user.findMany();
        },
      },
      user: {
        type: userType as GraphQLObjectType,
        args: { id: { type: UUIDType } },
        resolve: async (_parent, args: { id: string }) => {
          return prisma.user.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      memberTypes: {
        type: new GraphQLList(memberType),
        resolve: async () => {
          return prisma.memberType.findMany();
        },
      },
      memberType: {
        type: memberType,
        args: { id: { type: memberTypeIdEnum } },
        resolve: async (_parent, args: { id: MemberTypeId }) => {
          return prisma.memberType.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      posts: {
        type: new GraphQLList(postType),
        resolve: async () => {
          return prisma.post.findMany();
        },
      },
      post: {
        type: postType,
        args: { id: { type: UUIDType } },
        resolve: async (_parent, args: { id: string }) => {
          return prisma.post.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      profiles: {
        type: new GraphQLList(profileType),
        resolve: async () => {
          return prisma.profile.findMany();
        },
      },
      profile: {
        type: profileType as GraphQLObjectType,
        args: { id: { type: UUIDType } },
        resolve: async (_parent, args: { id: string }) => {
          return prisma.profile.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
    },
  });

  // ROOT SCHEMA
  const schema = new GraphQLSchema({
    query: queryType,
  });

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const graphqlRes = await graphql({
        schema,
        source: query,
        variableValues: variables,
      });

      return {
        data: graphqlRes.data,
        errors: graphqlRes.errors,
      };
    },
  });
};

export default plugin;
