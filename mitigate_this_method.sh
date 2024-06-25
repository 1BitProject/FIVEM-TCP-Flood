# Define the variables 
# MODIFY THE params based on your server capacity.
GAME_PORT=30120
TXADMIN_PORT=40120

# Flush existing rules
iptables -F
iptables -X

# Allow traffic on game port (TCP + UDP)
iptables -A INPUT -p tcp --dport $GAME_PORT -j ACCEPT
iptables -A INPUT -p udp --dport $GAME_PORT -j ACCEPT

# Allow traffic on TXAdmin port (TCP only)
iptables -A INPUT -p tcp --dport $TXADMIN_PORT -j ACCEPT

# Rate limiting: limit incoming connections to 20 per second, with burst of 40
iptables -A INPUT -p tcp --dport $GAME_PORT -m limit --limit 20/s --limit-burst 40 -j ACCEPT
iptables -A INPUT -p udp --dport $GAME_PORT -m limit --limit 20/s --limit-burst 40 -j ACCEPT
iptables -A INPUT -p tcp --dport $TXADMIN_PORT -m limit --limit 20/s --limit-burst 40 -j ACCEPT

# Connection limiting: limit to 10 connections per IP on game port
iptables -A INPUT -p tcp --syn --dport $GAME_PORT -m connlimit --connlimit-above 10 -j DROP
iptables -A INPUT -p udp --dport $GAME_PORT -m connlimit --connlimit-above 10 -j DROP

# Connection limiting: limit to 10 connections per IP on TXAdmin port
iptables -A INPUT -p tcp --syn --dport $TXADMIN_PORT -m connlimit --connlimit-above 10 -j DROP

# Allow established and related connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Drop invalid packets
iptables -A INPUT -m state --state INVALID -j DROP

# Default policy: drop all other traffic
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT
