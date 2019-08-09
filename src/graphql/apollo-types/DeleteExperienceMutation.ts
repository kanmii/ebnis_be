/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { FieldType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: DeleteExperienceMutation
// ====================================================

export interface DeleteExperienceMutation_deleteExperience_dataDefinitions {
  __typename: "DataDefinition";
  id: string;
  /**
   * Name of field e.g start, end, meal
   */
  name: string;
  /**
   * The data type of the field
   */
  type: FieldType;
  /**
   * String that uniquely identifies this data definition has been
   *   created offline. If an associated entry is also created
   *   offline, then `createField.definitionId` **MUST BE** the same as this
   *   field and will be validated as such.
   */
  clientId: string | null;
}

export interface DeleteExperienceMutation_deleteExperience {
  __typename: "Experience";
  /**
   * The ID of an object
   */
  id: string;
  /**
   * The title of the experience
   */
  title: string;
  /**
   * The description of the experience
   */
  description: string | null;
  /**
   * The client ID. For experiences created on the client while server is
   *   offline and to be saved , the client ID uniquely identifies such and can
   *   be used to enforce uniqueness at the DB level. Not providing client_id
   *   assumes a fresh experience.
   */
  clientId: string | null;
  insertedAt: any;
  updatedAt: any;
  hasUnsaved: boolean | null;
  /**
   * The field definitions used for the experience entries
   */
  dataDefinitions: (DeleteExperienceMutation_deleteExperience_dataDefinitions | null)[];
}

export interface DeleteExperienceMutation {
  /**
   * Delete an experience
   */
  deleteExperience: DeleteExperienceMutation_deleteExperience | null;
}

export interface DeleteExperienceMutationVariables {
  id: string;
}
