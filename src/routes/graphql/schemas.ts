import { Type } from '@fastify/type-provider-typebox';
import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
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
  fields: {
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
  },
});

export const postType = new GraphQLObjectType({
  name: 'Post',
  description: 'The post representation in the database',
  fields: {
    id: {
      type: new GraphQLNonNull(UUIDType),
      description: 'The id of the post',
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the post',
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The content of the post',
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
});
