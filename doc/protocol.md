The entire protocol is based upon Socket.IO (http://socket.io/).

Initialize connection
=====================

1) Client opens http(s)://lolbr/<chatroom>, a Socket.IO connection gets established
2) Client sends ``CONNECT`` command with room- and nickname.
3) Server responds 


Commands
========

CONNECT
-------
Arguments:
 - ``chatroom`` (str)
 - ``nickname`` (str)

Returns:
"CONNECT" (event)


MESSAGE
-------
Arguments:
 - ``text`` (str)

Returns:
``MESSAGE`` (event)


Events
======

CONNECT
-------
Parameters:
 - ``nickname`` (str)


MESSAGE
-------
Parameters:
 - ``nickname`` (str)
 - ``text`` (str)


 DISCONNECT
 ----------
 Parameters:
  - ``nickname``(str)
