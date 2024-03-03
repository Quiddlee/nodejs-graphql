import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  createGqlResponseSchema,
  gqlResponseSchema,
  memberType,
  memberTypeIdEnum,
  postType,
} from './schemas.js';
import {
  DocumentNode,
  graphql,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInputField,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  parse,
  validate,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';
import { CreateUpdateUserInput } from './types/user.js';
import { CreateUpdatePostInput } from './types/post.js';
import { ChangeProfileInput, CreateProfileInput } from './types/profile.js';
import {
  createPostInput,
  createUserInput,
  createProfileInput,
  changePostInput,
  changeProfileInput,
  changeUserInput,
} from './mutationInputSchemas.js';
import depthLimit from 'graphql-depth-limit';

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
        resolve: (parent: { id: string }) => {
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
        resolve: (parent: { memberTypeId: MemberTypeId }) => {
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

  // MUTATIONS
  const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createPost: {
        type: postType,
        args: {
          dto: {
            type: createPostInput,
          },
        },
        resolve: (_parent, args: { dto: CreateUpdatePostInput }) => {
          return prisma.post.create({ data: args.dto });
        },
      },
      createUser: {
        type: userType as GraphQLObjectType,
        args: {
          dto: {
            type: createUserInput,
          },
        },
        resolve: (_parent, args: { dto: CreateUpdateUserInput }) => {
          return prisma.user.create({ data: args.dto });
        },
      },
      createProfile: {
        type: profileType as GraphQLObjectType,
        args: {
          dto: {
            type: createProfileInput,
          },
        },
        resolve: (_parent, args: { dto: CreateProfileInput }) => {
          return prisma.profile.create({ data: args.dto });
        },
      },
      deletePost: {
        type: GraphQLString,
        args: {
          id: {
            type: UUIDType,
          },
        },
        resolve: async (_parent, args: { id: string }) => {
          await prisma.post.delete({
            where: {
              id: args.id,
            },
          });

          return null;
        },
      },
      deleteProfile: {
        type: GraphQLString,
        args: {
          id: {
            type: UUIDType,
          },
        },
        resolve: async (_parent, args: { id: string }) => {
          await prisma.profile.delete({
            where: {
              id: args.id,
            },
          });

          return null;
        },
      },
      deleteUser: {
        type: GraphQLString,
        args: {
          id: {
            type: UUIDType,
          },
        },
        resolve: async (_parent, args: { id: string }) => {
          await prisma.user.delete({
            where: {
              id: args.id,
            },
          });

          return null;
        },
      },
      changePost: {
        type: postType,
        args: {
          id: {
            type: UUIDType,
          },
          dto: {
            type: changePostInput,
          },
        },
        resolve: (_parent, args: { id: string; dto: CreateUpdatePostInput }) => {
          return prisma.post.update({
            where: {
              id: args.id,
            },
            data: args.dto,
          });
        },
      },
      changeProfile: {
        type: profileType as GraphQLObjectType,
        args: {
          id: {
            type: UUIDType,
          },
          dto: {
            type: changeProfileInput,
          },
        },
        resolve: (_parent, args: { id: string; dto: ChangeProfileInput }) => {
          return prisma.profile.update({
            where: {
              id: args.id,
            },
            data: args.dto,
          });
        },
      },
      changeUser: {
        type: userType as GraphQLObjectType,
        args: {
          id: {
            type: UUIDType,
          },
          dto: {
            type: changeUserInput,
          },
        },
        resolve: (_parent, args: { id: string; dto: CreateUpdateUserInput }) => {
          return prisma.user.update({
            where: {
              id: args.id,
            },
            data: args.dto,
          });
        },
      },
      subscribeTo: {
        type: userType as GraphQLObjectType,
        args: {
          userId: {
            type: UUIDType,
          },
          authorId: {
            type: UUIDType,
          },
        },
        resolve: (_parent, args: { userId: string; authorId: string }) => {
          return prisma.user.update({
            where: {
              id: args.userId,
            },
            data: {
              userSubscribedTo: {
                create: {
                  authorId: args.authorId,
                },
              },
            },
          });
        },
      },
      unsubscribeFrom: {
        type: GraphQLString,
        args: {
          userId: {
            type: UUIDType,
          },
          authorId: {
            type: UUIDType,
          },
        },
        resolve: async (_parent, args: { userId: string; authorId: string }) => {
          await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          });

          return null;
        },
      },
    },
  });

  // ROOT SCHEMA
  const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
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

      const document = parse(query);
      const validationErrors = validate(schema, document, [depthLimit(5)]);
      const isErrors = validationErrors.length > 0;

      if (isErrors)
        return {
          data: null,
          errors: validationErrors,
        };

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
