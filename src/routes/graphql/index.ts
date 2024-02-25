import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  createGqlResponseSchema,
  gqlResponseSchema,
  memberType,
  memberTypeIdEnum,
  postType,
  profileType,
  userType,
} from './schemas.js';
import { graphql, GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: {
        users: {
          type: new GraphQLList(userType),
          resolve: async () => {
            return prisma.user.findMany();
          },
        },
        user: {
          type: userType,
          args: { id: { type: UUIDType } },
          resolve: async (_parent, args: { id: string }) => {
            return await prisma.user.findUnique({
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
            return await prisma.user.findUnique({
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
            return await prisma.user.findUnique({
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
          type: profileType,
          args: { id: { type: UUIDType } },
          resolve: async (_parent, args: { id: string }) => {
            return await prisma.user.findUnique({
              where: {
                id: args.id,
              },
            });
          },
        },
      },
    }),
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
