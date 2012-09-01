The entire protocol is based upon Socket.IO (http://socket.io/).

Initialize connection
=====================

1) Client opens http(s)://lolbr/<chatroom>, a Socket.IO connection gets established
2.a) If no session is available, server sends ``REQUIRE_AUTH`` event, user sends ``AUTH`` command
2.b) If session is available, server sends ``AUTH`` event
3) Client sends ``JOIN`` command with roomname


Commands
========

HAI
---
Must be sent after ``CONNECT_OK`` event.

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

NICKNAME
--------
Provides nickname for current session.

Arguments:
 - ``nickname`` (str)

Returns:
  - ``WELCOME`` (event)
  - ``REQUIRE_NICKNAME`` (event)


Events
======

CONNECT_OK
----------
Connect was OK, event handlers were assigned, ready to auth / set nickname.
Server awaits ``HAI`` command to start authentication.

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

MISSING_PARAMETER
-----------------
 - ``parameter`` (str)

REQUIRE_NICKNAME
----------------
Server awaits ``NICKNAME`` command.
Parameters:
 - ``reason`` (str: UNKNOWN|NOT_SANE)

WELCOME
-------
Authentication successful.

Parameters:
 - ``nickname`` (str)
