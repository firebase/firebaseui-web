
<script>
import { createEventDispatcher, onMount } from 'svelte';

let __ref;
let __mounted = false;

const dispatch = createEventDispatcher();

export let autoUpgradeAnonymousUsers = undefined;
export let tosUrl = undefined;
export let privacyPolicyUrl = undefined;
export let signInSuccessUrl = undefined;
export let assetBasePath = undefined;

export const setAuth = (...args) => __ref.setAuth(...args);

export const getWebComponent = () => __ref;

onMount(() => { __mounted = true; });

const setProp = (prop, value) => { if (__ref) __ref[prop] = value; };



const onEvent = (e) => {
  e.stopPropagation();
  dispatch(e.type, e.detail);
};
</script>

<firebase-sign-in-form 
  auto-upgrade-anonymous-users={autoUpgradeAnonymousUsers}
  tos-url={tosUrl}
  privacy-policy-url={privacyPolicyUrl}
  sign-in-success-url={signInSuccessUrl}
  asset-base-path={assetBasePath}
  on:signInSuccessful={onEvent}
  bind:this={__ref}
>
  <slot></slot>
</firebase-sign-in-form>
  