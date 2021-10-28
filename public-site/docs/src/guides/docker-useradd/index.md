---
title: Users in Docker
sidebarDepth: 2
---
## Add user and group in Docker

### Difference between “adduser” and “useradd”

"useradd" is native binary compiled with the system
"adduser" is a perl script which uses useradd binary in back-end. It is more user-friendly and interactive compared to back-end useradd.
With "adduser" the system level users account when created puts a user directory in home for the system user where "useradd" does not.

For non-root users ids above 999 should be used.

Different distributions (and their flavours) might have different options:

### Debian

[debian info](https://manpages.debian.org/jessie/adduser/adduser.8.en.html) (also [Ubuntu info](http://manpages.ubuntu.com/manpages/trusty/man8/adduser.8.html), etc.)

**-g or --gid**  
groupadd --gid GID &lt;groupname&gt;

**-g or --gid; -u or --uid**  
useradd --gid GID --uid UID &lt;username&gt;

**only --gid**  
addgroup --gid GID &lt;groupname&gt;

**only --uid and --gid**  
adduser --gid GID --uid UID &lt;username&gt;

### Alpine

[Alpine info](https://wiki.alpinelinux.org/wiki/Setting_up_a_new_user), groupadd and useradd are not available

**-g or --gid**  
addgroup -g GID &lt;groupname&gt;
  
**only -g; -u or --uid**  
adduser -g GID -u UID &lt;username&gt;

### Archlinux

[Archlinux info](https://wiki.archlinux.org/title/users_and_groups) - [more info...](https://aur.archlinux.org/packages/adduser/), addgroup and adduser are not available

**-g or --gid**  
groupadd --gid GID groupname

**-g or --gid; -u or --uid**  
useradd --gid GID --uid UID username
