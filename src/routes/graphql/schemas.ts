import { Type } from '@fastify/type-provider-typebox';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql/index.js';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const userType = new GraphQLObjectType({
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
  }),
});

export const memberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    [MemberTypeId.BASIC]: { value: MemberTypeId.BASIC },
    [MemberTypeId.BUSINESS]: { value: MemberTypeId.BUSINESS },
  },
});

export const memberType = new GraphQLObjectType({
  name: 'Member',
  description: 'The member type representation in the database',
  fields: () => ({
    id: {
      type: memberTypeIdEnum,
      description: 'The id of the member type',
    },
    discount: {
      type: GraphQLFloat,
      description: 'The discount of the member type',
    },
    postsLimitPerMonth: {
      type: GraphQLInt,
      description: 'The current post limit per month of the member type',
    },
  }),
});

export const postType = new GraphQLObjectType({
  name: 'Post',
  description: 'The post representation in the database',
  fields: () => ({
    id: {
      type: UUIDType,
      description: 'The id of the post',
    },
    title: {
      type: GraphQLString,
      description: 'The title of the post',
    },
    content: {
      type: GraphQLString,
      description: 'The content of the post',
    },
  }),
});

export const profileType = new GraphQLObjectType({
  name: 'Profile',
  description: 'The profile representation in the database',
  fields: () => ({
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
  }),
});
