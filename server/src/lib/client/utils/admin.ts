import {post, deleteRequest, authedGet} from '$lib/client/backend';
import type {AdminStatus, IdentityWithKeys} from "$lib/types";

export const isAdmin = (identity: IdentityWithKeys, id: string) =>
    authedGet<AdminStatus>(identity, `/admin/${id}`).then(result => Boolean(result[1] && result[0]?.admin));


export const addAdmin = (identity: IdentityWithKeys, id: string) =>
  post(identity, `/admin/${id}`, {});

export const removeAdmin = (identity: IdentityWithKeys, id: string) =>
  deleteRequest(identity, `/admin/${id}`, {});
