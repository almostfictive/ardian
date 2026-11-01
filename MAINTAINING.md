# Keeping Ardian in step with Ardia

Ardian is your copy of Ardia. The original project is https://github.com/mantrakp04/ardia. New work there does not show up here until you bring it in.

Do that on a new branch, not on main. A bad merge is easy to throw away if it never landed on main.

## See the gap

From this repo, once:

```sh
git remote add upstream https://github.com/mantrakp04/ardia.git
```

Then, whenever you want a fresh answer:

```sh
git fetch upstream
git rev-list --left-right --count main...upstream/main
```

The first number is commits you have that Ardia does not. The second is commits Ardia has that you do not.

To see if a merge would be clean, without changing your files:

```sh
git merge-tree --write-tree --name-only --messages main upstream/main
```

If that prints `CONFLICT`, Git cannot combine those files on its own.

On 1 Nov 2026 this fork was 61 commits ahead and 44 behind. That trial merge was not clean. Both sides had edited the same screens (the README, sidebar, toolbar, settings, new tab, and others). Live Folders is the awkward one: this fork deleted that settings screen, and Ardia has changed it since. Run the commands again before you merge. Those counts will move.

## Bring the updates in

1. `git fetch upstream`
2. `git checkout -b update-from-ardia`
3. `git merge upstream/main`
4. For each conflict, decide which side to keep. Your Ardian name, bundle id, icon, and the screens you changed are the parts that clash with Ardia's newer work. Do not assume either side is always right.
5. Build and try the app on your Mac. This project is a Mac app, so a Linux machine cannot finish that check.
6. Open a pull request from that branch. Do not merge upstream straight into main.

If the merge is a mess, delete the branch and leave main as it is.
