import {post, deleteRequest} from '$lib/client/backend';
import type {IdentityWithKeys} from "$lib/types";

export const addAdmin = (identity: IdentityWithKeys, id: string) =>
  post(identity, `/admin/${id}`, {});

export const removeAdmin = (identity: IdentityWithKeys, id: string) =>
  deleteRequest(identity, `/admin/${id}`, {});
