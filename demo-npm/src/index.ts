const { ui, config, deleteAccount, signOut } = await import('./firebaseui');

ui.start('#firebaseui-container', config);

document.getElementById('delete-account')!.addEventListener('click', () => deleteAccount());
document.getElementById('sign-out')!.addEventListener('click', () => signOut());

export { };
