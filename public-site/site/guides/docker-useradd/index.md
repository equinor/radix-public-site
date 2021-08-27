---
title: Users in Docker
layout: document
parent: ["Guides", "../../guides.html"]
toc: true
---
## Add user and group in Docker

### Difference between “adduser” and “useradd”

"useradd" is native binary compiled with the system
"adduser" is a perl script which uses useradd binary in back-end. It is more userfriendly and interactive compared to back-end useradd.
With "adduser" the system level users account when created puts a user directory in home for the system user where "useradd" does not.  

For non-root users id above 999 should be used.  

Different distributions (and their flavours) might have different options:  

### Debian 
https://manpages.debian.org/jessie/adduser/adduser.8.en.html (also Ubuntu, etc. http://manpages.ubuntu.com/manpages/trusty/man8/adduser.8.html )  

**-g or --gid**  
groupadd --gid GID <groupname>  
  
**-g or --gid; -u or --uid**  
useradd --gid GID --uid ID <username>  

**only --gid**  
addgroup --gid GID <groupname>  
  
**only --uid and --gid**  
adduser --gid GID --uid ID <username>

### Alpine  
https://wiki.alpinelinux.org/wiki/Setting_up_a_new_user  

**-g or --gid**  
addgroup -g GID <groupname>  
  
**only -g; -u or --uid**  
adduser -g GID -u UID <username>  
  
groupadd and useradd are not available  

### Archlinux  
https://wiki.archlinux.org/title/users_and_groups https://aur.archlinux.org/packages/adduser/  

**-g or --gid**  
groupadd --gid GID <groupname>  
  
**-g or --gid; -u or --uid**  
useradd --gid GID --uid UID <username>  

addgroup and adduser are not available
