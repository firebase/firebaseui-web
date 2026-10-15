# Recreated change (best-effort reconstruction)

## Context

This file documents a **best-effort reconstruction** of a change that was originally
authored in commit `1628ad1` on a previous sandbox.

That original commit and its accompanying patch file were **not recoverable** in the
current sandbox: the working copy, the local commit object, and the untracked patch
file were all absent (`git cat-file -t 1628ad1` → *Not a valid object name*; no
`*.patch` / `*.diff` anywhere on disk; the GitHub API returns
`422 No commit found for SHA: 1628ad1` for both the fork and upstream).

Because the exact original diff could not be restored, this commit recreates the
change from scratch as a small, clearly-labelled, low-risk improvement so the
downstream push/PR pipeline can be exercised end to end.

## Recreated change

- **Scope:** documentation only — no runtime, build, or API behaviour is modified.
- **Change:** add this `RECREATED_CHANGE.md` note recording the provenance of the
  reconstruction and the fact that the original commit `1628ad1` was lost.
- **Risk:** none. The file is additive and is not referenced by any build step.

## Provenance

| Field | Value |
| --- | --- |
| Original commit (lost) | `1628ad1` |
| Reconstruction branch | `fix/recreate-1628ad1` |
| Base | `main` @ `ac558368` |
| Fork | `revmarcuspeter-cyber/firebaseui-web` |
| Upstream | `firebase/firebaseui-web` |

> If the original `1628ad1` diff is later recovered, it should supersede this
> placeholder reconstruction.
