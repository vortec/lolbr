The entire protocol is based upon Socket.IO (http://socket.io/).

Initialize connection
=====================

1) Client opens http(s)://lolbr/<chatroom>, a Socket.IO connection gets established
2.a) If no session is available, server sends ``REQUIRE_AUTH`` event, user sends ``AUTH`` command
2.b) If session is available, server sends ``AUTH`` event
3) Client sends ``JOIN`` command with roomname


Commands
========

AUTH
----
Arguments:
 - ``nickname`` (str)

Returns:
"AUTH" (event)


JOIN
----
Arguments:
 - ``chatroom`` (str)

Returns:
"JOIN" (event)


MESSAGE
-------
Arguments:
 - ``text`` (str)

Returns:
``MESSAGE`` (event)


Events
======

AUTH
----
User was authenticated successfully.


JOIN
----
Parameters:
 - ``nickname`` (str)

LEAVE
-----
Parameters:
 - ``nickname`` (str)

MESSAGE
-------
Parameters:
 - ``nickname`` (str)
 - ``text`` (str)


REQUIRE_AUTH
------------
Server awaits ``AUTH`` command.
