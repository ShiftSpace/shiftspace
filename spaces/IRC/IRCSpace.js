var IRCSpace = ShiftSpace.Space.extend({
  attributes :
  {
    name : 'IRC',
    version : 0.1, 
    icon : 'IRC.png',
    css : 'IRC.css'
  },
  
  setup: function()
  {
    this.hostname = "irc.freenode.net";
    this.channel = "#orbited.tutorial";
    this.port = 6667;
    this.nickname = "";

    this.client = new IRCClient();

    this.client.onopen = function() {
      this.nickname = prompt("Please enter a user name");
      
      this.client.nick(this.nickname);
      this.client.ident(this.nickname, "8 *", "Tutorial User");
      this.client.join(this.channel);
    }.bind(this);
    
    this.client.onnickInUse = function() {
      this.nickname = prompt("That name was taken. Please try another");
      
      this.client.nick(this.nickname);
      this.client.ident(this.nickname, "8 *", "Tutorial User" );
      this.client.join(this.channel);
    }.bind(this);
    
    this.client.onmessage = function(sender, place, msg) {
      if (place == this.channel) 
      {
        var nick = sender.slice(0, sender.search("!"));
        this.printOutput(nick + ": " + msg);
      }
    }.bind(this);
  },
  
  
  printOutput: function(str)
  {
    var output = document.getElementById("IRCSpaceOutput");

    // make output HTML safe
    str = str.replace("&", "&amp;", "g");
    .replace("<", "&lt;", "g");
    .replace(" ", "&nbsp;", "g");

    output.innerHTML += s + "<br>";
    output.scrollTop = output.scrollHeight;
  },
  
  
  sendMessage: function()
  {
    var input = document.getElementById("IRCSpaceInput");
    this.printOutput(this.nickname + ": " + input.value);
    this.client.privmsg(this.channel, input.value);
  },
  
  
  showInterface: function()
  {
    this.element.removeClass('SSDisplayNone');
  },
  
  
  hideInterface: function()
  {
    this.element.addClass('SSDisplayNone');
  },
  
  
  buildInterface: function()
  {
    this.element = new ShiftSpace.Element('div', {
      'class': "IRCSpace SSDisplayNone"
    });
    
    this.output = new ShiftSpace.Element('div', {
      id: "IRCSpaceOutput"
    });
    this.output.injectInside(this.element);

    this.input = new ShiftSpace.Element('input', {
      id: "IRCSpaceInput", 
      type: "text"
    });
    this.input.injectInside(this.element);
    
    this.button = new ShiftSpace.Element('button', {
      id: "IRCSpaceButton"
    });
    this.button.setText('Send');
    this.button.addEvent('click', this.sendMessage);
    this.button.injectInside(this.element);

    this.connectButton = new ShiftSpace.Element('button', {
      id: "IRCConnectButton"
    });
    this.connectButton.setText('Connect');
    this.connectButton.addEvent('click', this.client.connect.bind(this, [this.hostname, this.port]));
    this.connectButton.injectInside(this.element);
  }
});

var IRCShift = ShiftSpace.Shift.extend({
  setup: function(json)
  {
    
  }
});

var IRC = new IRCSpace(IRCShift);

document.domain=document.domain
// Browser detect by Frank Salim
var browser = null;
if (typeof(ActiveXObject) != "undefined") {
    browser = 'ie'
} else if (navigator.product == 'Gecko' && window.find && !navigator.savePreferences) {
    browser = 'firefox'
} else if((typeof window.addEventStream) === 'function') {
    browser = 'opera'
} else {
    throw new Error("couldn't detect browser")
}


// start @include(URL.js)
URL = function(_url) {
    var self = this;
    var protocolIndex = _url.indexOf("://")
    if (protocolIndex != -1)
        self.protocol = _url.slice(0,protocolIndex)
    else
        protocolIndex = -3
    var domainIndex = _url.indexOf('/', protocolIndex+3)
    if (domainIndex == -1)
        domainIndex=_url.length
    var hashIndex = _url.indexOf("#", domainIndex)
    if (hashIndex != -1)
        self.hash = _url.slice(hashIndex+1)
    else
        hashIndex = _url.length
    var uri = _url.slice(domainIndex, hashIndex)
    var qsIndex = uri.indexOf('?')
    if (qsIndex == -1)
        qsIndex=uri.length
    self.path = uri.slice(0, qsIndex)
    self.qs = uri.slice(qsIndex+1)
    if (self.path == "")
        self.path = "/"
    var domain = _url.slice(protocolIndex+3, domainIndex)
    var portIndex = domain.indexOf(":")
    if (portIndex == -1) {
        self.port = 80
        portIndex = domain.length
    }
    else {
        self.port = parseInt(domain.slice(portIndex+1))
    }
    if (isNaN(this.port))
        throw new Error("Invalid _url")
    self.domain = domain.slice(0, portIndex)

    self.render = function() {
        var output = ""
        if (typeof(self.protocol) != "undefined")
            output += self.protocol + "://"
        output += self.domain
        if (self.port != 80 && typeof(self.port) != "undefined" && self.port != null)
            if (typeof(self.port) != "string" || self.port.length > 0)
                output += ":" + self.port
        if (typeof(self.path) == "undefined" || self.path == null)
            output += '/'
        else
            output += self.path
        if (self.qs.length > 0)
            output += '?' + self.qs
        if (typeof(self.hash) != "undefined" && self.hash.length > 0)
            output += "#" + self.hash
        return output
    }
    self.isSameDomain = function(_url) {
        _url = new URL(_url)

/*        console.log('isSame? ' + _url.render())
        console.log('self: ' + self.render())
        console.log('_url.domain: ' + _url.domain)
        console.log('self.domain: ' + self.domain) */
        if (!_url.domain || !self.domain)
            return true
        return (_url.port == self.port && _url.domain == self.domain)
    }
/*    self.isSameParentDomain = function(_url) {
        _url = new URL(_url)
        var parts = _url.domain.split('.')
        for (var i = 0; i < parts.length-1; ++i) {
            var new_domain = parts.slice(i).join(".")
            if (new_domain == self.domain)
                return true;
        }
    }
*/
    self.isSameParentDomain = function(_url) {
        _url = new URL(_url)
        if (_url.domain == self.domain) {
            return true;
        }
        var orig_domain = _url.domain;
        var parts = document.domain.split('.')
//        var orig_domain = document.domain
        for (var i = 0; i < parts.length-1; ++i) {
            var new_domain = parts.slice(i).join(".")
            if (orig_domain == new_domain)
                return true;
        }
        return false
    }

    var decodeQs = function(qs) {
    //    alert('a')
        if (qs.indexOf('=') == -1) return {}
        var result = {}
        var chunks = qs.split('&')
        for (var i = 0; i < chunks.length; ++i) {
            var cur = chunks[i]
            pieces = cur.split('=')
            result[pieces[0]] = pieces[1]
        }
        return result
    }
    var encodeQs = function(o) {
            var output = ""
            for (key in o)
                output += "&" + key + "=" + o[key]
            return output.slice(1)
        }
    self.setQsParameter = function(key, val) {
        var curQsObj = decodeQs(self.qs)
        curQsObj[key] = val
        self.qs = encodeQs(curQsObj)
    }

    self.mergeQs = function(qs) {
        var newQsObj = decodeQs(qs)
        for (key in newQsObj) {
            curQsObj[key] = newQsObj[key]
        }
    }
    self.removeQsParameter = function(key) {
        var curQsObj = decodeQs(self.qs)
        delete curQsObj[key]
        self.qs = encodeQs(curQsObj)
    }

    self.merge = function(targetUrl) {
        if (typeof(self.protocol) != "undefined" && self.protocol.length > 0) {
            self.protocol = targetUrl.protocol
        }
        if (targetUrl.domain.length > 0) {
            self.domain = targetUrl.domain
            self.port = targetUrl.port
        }
        self.path = targetUrl.path
        self.qs = targetUrl.qs
        self.hash = targetUrl.hash
    }

}

// end @include(URL.js)


// start @include(transports/TransportChooser.js)
TransportChooser = {}
TransportChooser.create = function() {
    // Browser detect by Frank Salim
    var browser = null;
    if (typeof(ActiveXObject) != "undefined") {
        browser = 'ie'
    } else if (navigator.product == 'Gecko' && window.find && !navigator.savePreferences) {
        browser = 'firefox'
    } else if((typeof window.addEventStream) === 'function') {
        browser = 'opera'
    } else {
        throw new Error("couldn't detect browser")
    }
    
    switch(browser) {
        case 'firefox':
            return new XHRStream();
        case 'ie':
            return new HTMLFile();
        case 'opera':
            return new SSE();
    }
}
// end @include(transports/TransportChooser.js)

switch(browser) {
    case 'firefox': // this is also case 'safari'
        
// start @include(transports/XHRStream.js)
// Requires: URL.js
// Requires: XSubdomainRequest.js

XHRStream = function() {
    var ESCAPE = "_"
    var PACKET_DELIMITER = "_P"
    var ARG_DELIMITER = "_A"
    var self = this;
    var url = null;
    xhr = null;
    var ackId = null;
    var offset = 0;
    self.retry = 50
    self.readyState = 0

    self.onread = function(packet) { }

    self.connect = function(_url) {
        if (self.readyState == 1) {
            throw new Error("Already Connected")
        }
        url = new URL(_url)
        if (xhr == null) {
            if (url.isSameDomain(location.href)) {
                xhr = new XMLHttpRequest();
            }
            else {
                xhr = new XSubdomainRequest(url.domain, url.port);
            }
        }
        url.setQsParameter('transport', 'xhrstream')
        self.readyState = 1
        open()
    }
    open = function() {

        xhr.open('GET', url.render(), true)
        if (typeof(ackId) == "number")
            xhr.setRequestHeader('ack', ackId)
        xhr.onreadystatechange = function() {
            switch(xhr.readyState) {
                case 3:
                    process();
                    break;
                case 4:
                    switch(xhr.status) {
                        case 200:
                            process();
                            reconnect();
                            break;
                        default:
                            self.disconnect();
                    }
            }
        }
        xhr.send(null);
    }
    self.disconnect = function() {
        self.readyState = 2
        xhr.onreadystatechange = function() { }
        xhr.abort()
        xhr = null;
    }
    var reconnect = function() {
        offset = 0;
        setTimeout(open, self.retry)
    }
    var process = function() {
        var stream = xhr.responseText;
        while (true) {
            if (stream.length <= offset) {
                return;
            }
            var nextBoundary = stream.indexOf(PACKET_DELIMITER, offset);
            if (nextBoundary == -1)
                return;
            var packet = stream.slice(offset, nextBoundary);
            offset = nextBoundary + PACKET_DELIMITER.length
            receivedPacket(packet)
        }
    }

    var receivedPacket = function(packetData) {
        var args = packetData.split(ARG_DELIMITER)
        ackId = parseInt(args[0])
        packet = {
            id: ackId,
            name: args[1],
            args: args.slice(2)
        }
        self.onread(packet)
    }
}
// end @include(transports/XHRStream.js)

        break;
    case 'ie':
        
// start @include(transports/HTMLFile.js)
HTMLFile = function() {
    var self = this;
    id = ++HTMLFile.prototype.i;
    HTMLFile.prototype.instances[id] = self
    var htmlfile2 = null
    var url = null;
    self.onread = function(packet) { }

    self.connect = function(_url) {
        if (self.readyState == 1) {
            throw new Error("Already Connected")
        }
        url = new URL(_url)
        url.setQsParameter('transport', 'htmlfile')
        url.setQsParameter('frameID', id.toString())
//        url.hash = id.toString()
        self.readyState = 1
        doOpen()
    }

    var doOpenIfr = function() {
        
        var ifr = document.createElement('iframe')
        ifr.src = url.render()
        document.body.appendChild(ifr)
    }

    var doOpen = function() {
        htmlfile = new ActiveXObject('htmlfile'); // magical microsoft object
        htmlfile.open();
        htmlfile.write('<html><script>' + 'document.domain="' + document.domain + '";' + '</script></html>');
        htmlfile.parentWindow.HTMLFile = HTMLFile;
        htmlfile.close();
        var iframe_div = htmlfile.createElement('div');
        htmlfile.body.appendChild(iframe_div);
        iframe_div.innerHTML = "<iframe src=\"" + url.render() + "\"></iframe>";
    }
    
    self.receive = function(id, name, args) {
        packet = {
            id: id,
            name: name,
            args: args
        }
        self.onread(packet)
    }
}

HTMLFile.prototype.i = 8
HTMLFile.prototype.instances = {}
// end @include(transports/HTMLFile.js)

        break;
    case 'opera':
        
// start @include(transports/SSEAppXDom.js)
SSE = function() {
    var self = this;
    self.onread = function(packet) { }
    var source = null
    var url = null;
    self.connect = function(_url) {
        if (self.readyState == 1) {
            throw new Error("Already Connected")
        }
        url = new URL(_url)
        url.setQsParameter('transport', 'sse')
        self.readyState = 1
        open()
    }

    open = function() {
        var source = document.createElement("event-source");
        source.setAttribute('src', url.render());
//      TODO: uncomment this line to work in opera 8 - 9.27.
//            there should be some way to make this work in both.
//        document.body.appendChild(source);
        source.addEventListener('orbited', receiveSSE, false);
    }
    var receiveSSE = function(event) {
        var data = eval(event.data);
        if (typeof(data) != 'undefined') {
            for (var i = 0; i < data.length; ++i) {
                var packet = data[i]
                receive(packet[0], packet[1], packet[2]);
            }
        }
    
    }
                
    var receive = function(id, name, args) {
        packet = {
            id: id,
            name: name,
            args: args
        }
        self.onread(packet)
    }
}

// end @include(transports/SSEAppXDom.js)

        break;
}

// start @include(BaseTCPConnection.js)
BaseTCPConnection = function() {
    var self = this;
    transport = null;
    var url = null;
    var sendUrl = null;
    var xhr = null;
    var sendQueue = []
    var sending = false;
    var numSent = null;
    var ackId = 0;
    self.readyState = 0;
    
    self.connect = function(_url) {
        if (self.readyState != 0 && self.readyState != 3) {
            throw new Error("Invalid readyState for connect");
        }
        url = new URL(_url);
        if (url.isSameDomain(location.href)) {
            xhr = createXHR();
        }
        else {
            xhr = new XSubdomainRequest(url.domain, url.port);
        }
        self.readyState = 1;
        getSession();
    }
        
    self.send = function(data) {
        sendQueue.push(data)
        if (!sending) {
            doSend();
        }
    }
    
    var doSend = function() {
        if (sendQueue.length == 0) {
            sending = false;
            return
        }
        sending = true;
        numSent = sendQueue.length
        xhr.open('POST', url.render(), true)
        xhr.setRequestHeader('ack', ackId)
        xhr.setRequestHeader('Tcp-Encoding', 'text')
        xhr.onreadystatechange = function() {
            switch(xhr.readyState) {
                case 4:
                    switch(xhr.status) {
                        case 200:
                            sendQueue = sendQueue.slice(numSent)
                            return doSend();
                    }
                    break;
            }
        }
        xhr.send(sendQueue.join(""))
    
    }

    var sendPingResponse = function() {
        xhr.open('POST', url.render(), true)
        xhr.setRequestHeader('ack', ackId)
        xhr.onreadystatechange = function() {
            switch(xhr.readyState) {
                case 4:
                    switch(xhr.status) {
                        case 200:
                    }
                    break;
            }
        }
        xhr.send(null)
    }

    var getSession = function() {
        xhr.open('GET', url.render(), true)
        xhr.onreadystatechange = function() {
            switch(xhr.readyState) {
                case 4:
                    switch(xhr.status) {
                        case 200:
                            var key = xhr.responseText
                            if (url.path[url.path.length-1] != '/') {
                                url.path += '/'
                            }
                            url.path += key
                            sendUrl = new URL(url.render())
                            connectTransport()
                            break;                    
                    }
                    break;
            }
        }
        xhr.send(null);
    }
    
    var connectTransport = function()  {
        transport = TransportChooser.create();
        transport.connect(url.render())
        transport.onread = packetReceived
    }

    var packetReceived = function(packet) {
        if (!isNaN(packet.id) && packet.id > ackId) {
            ackId = packet.id
        }
        switch(packet.name) {
            case 'open':
                doOpen();
                break;
            case 'close':
                doClose();
                break;
            case 'data':
                doRead(packet.args)
                break;
            case 'ping':
                sendPingResponse();
                break;
        }
    }

    var doOpen = function() {
        if (self.readyState != 1) {
            throw new Error("Received invalid open")
        }
        self.readyState = 2;
        self.onopen();
    }
    var doClose = function() {
        if (self.readyState == 3) {
            throw new Error("already closed")
        }
        self.readyState = 3;
        self.onclose();
    }
    var doRead = function(args) {
        var data = args[0]
        self.onread(data);
    }

    var createXHR = function () {
        try { return new ActiveXObject('MSXML3.XMLHTTP'); } catch(e) {}
        try { return new ActiveXObject('MSXML2.XMLHTTP.3.0'); } catch(e) {}
        try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
        try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
        try { return new XMLHttpRequest(); } catch(e) {}
        throw new Error('Could not find XMLHttpRequest or an alternative.');
    }
}
// end @include(BaseTCPConnection.js)


// start @include(XSubdomainRequest.js)
XSubdomainRequest = function(bridgeDomain, bridgePort, bridgePath, markedHeaders) {
    var self = this;
    if (!Boolean(bridgeDomain))
        throw new Error("Invalid bridge domain")
    if (!Boolean(bridgePath))
        bridgePath = "/static/XSubdomainBridge.html"
    if (!Boolean(markedHeaders))
        markedHeaders = [
            'Location',
        ]

    var ifr = null;
    var tempUrl = new URL("")
    tempUrl.domain = bridgeDomain
    tempUrl.port = bridgePort
    tempUrl.path = bridgePath
    var bridgeUrl = 'http://' + tempUrl.render()
    var receive = function(payload) {
//        alert('received: ' + payload);
        if (payload[0] == "initialized") {
            push([method, url, data, requestHeaders, markedHeaders])
        }
        if (payload[0] == "readystatechange") {
//            alert('readyState: ' + payload[1].readyState)
            self.readyState = payload[1].readyState
            if (typeof(payload[1].status) != "undefined") {
//                alert('status = ' + payload[1].status)
                self.status = payload[1].status
            }
            if (typeof(payload[1].responseText) != "undefined") {
//                alert('responseText += (' + payload[1].responseText.length + '): ' + payload[1].responseText)
                self.responseText += payload[1].responseText
            }
            if (typeof(payload[1].headers) != "undefined") {
                responseHeaders = payload[1]['headers']
            }
            self.onreadystatechange();
        }
    }
    self.getResponseHeader = function(key) {
        return responseHeaders[key];
    }
    self.getAllResponseHeaders = function() {
        return responseHeaders;
    }
    var queue = []
    var id = self._register(receive, queue);
    var push = function(payload) {
//        alert('push: ' + payload)
        self._state.queues[id].push(payload)
    }

    self.responseText = ""
    self.readyState = 0;
    self.status = null;
    self.onreadystatechange = function() { }
    var url = null;
    var method = null;
    var data = null;
    var requestHeaders = {};
    var responseHeaders = {}

    self.open = function(_method, _url, async) {
        if (self.readyState == 4) {
            self.responseText = ""
            self.status = null;
            self.readyState = 0;
            url = null;
            method = null;
            data = null;
            requestHeaders = {};
        }
        if (self.readyState != 0)
            throw new Error("Invalid Ready State for open")
        if (!async)
            throw new Error("Only Async XSDR supported")
        url = _url
        method = _method;
    }
    self.setRequestHeader = function(key, val) {
        if (self.readyState != 0)
            throw new Error("Invalid Ready State for setRequestHeader")
        requestHeaders[key] = val
    }
    self.send = function(_data) {
        /* TODO: auto-generate the bridgeUrl
        if (!Boolean(bridgeUrl)) {
            if (!Boolean(url.domain))
                throw new Error("invalid domain")
            var tempURL = URL(url.render())
            tempURL.path = "/
        */
        data = _data;
        if (ifr == null) {
            ifr = document.createElement("iframe")
            hideIframe(ifr);
            ifr.src = bridgeUrl + "#" + id;
            document.body.appendChild(ifr);
        }
        else {
            push([method, url, data, requestHeaders, markedHeaders])

        }
    }

    var hideIframe =function (ifr) {
        ifr.style.display = 'block';
        ifr.style.width = '0';
        ifr.style.height = '0';
        ifr.style.border = '0';
        ifr.style.margin = '0';
        ifr.style.padding = '0';
        ifr.style.overflow = 'hidden';
        ifr.style.visibility = 'hidden';
    }

}



XSubdomainRequest.prototype._state = { 
    requests: {},
    queues: {},
    id: 0
}
XSubdomainRequest.prototype._register = function(receive, queue) {
    var self = XSubdomainRequest.prototype;
    var id = ++self._state.id;
    self._state.requests[id] = receive;
//    alert('receive: ' + self._state.requests[id])
    self._state.queues[id] = queue;
//    alert(JSON.stringify(XSubdomainRequest.prototype._state))
    return id;
}

XSubdomainRequest.prototype._event = function(id, payload) {
    var self = XSubdomainRequest.prototype;
    var receive = self._state.requests[id];
    receive(payload);
}

// end @include(XSubdomainRequest.js)


// start @include(TCPSocketImplementation.js)
TCPSocket = function(domain, port) {
    var self = this;
    self.onopen = function() { }
    self.onclose = function() { }
    self.onread = function() { }
    self.readyState = 0

    var conn = new BaseTCPConnection()

    self.send = function(data) {
        conn.send(data);
    }
    conn.onread = function(data) {
        self.onread(data);
    }
    conn.onclose = function() {
        self.readyState = conn.readyState
        self.onclose();
    }
    conn.onopen = function() {
        self.readyState = conn.readyState
        conn.send(domain + ":" + port)
        self.onopen()
    }
    var connUrl = new URL(location.href)
    if (typeof(ORBITED_DOMAIN) != "undefined") 
        connUrl.domain = ORBITED_DOMAIN
    // Otherwise use the href domain
    if (typeof(ORBITED_PORT) != "undefined")
        connUrl.port = ORBITED_PORT
//    else
//        connUrl.port = connUrl.port
    connUrl.path = "/proxy"
    connUrl.qs = ""
//    alert('connecting to: ' + connUrl.render())
    conn.connect(connUrl.render())
}

// end @include(TCPSocketImplementation.js)


/* This code is meant to accompany a tutorial explaining how to write
 * network clients with Orbited 0.5
 *
 * Frank Salim (frank.salim@gmail.com)
 * Â©2008 The Orbited Project
 */

IRCClient = function() 
{
  var self = this;
  var conn = null;
  var buffer = "";
  var ENDL = "\r\n";
 
  self.onconnect = function() {/* Do nothing in default callbacks*/}
  self.onnickInUse = function() {}
  self.onmessage = function() {}
  self.onclose = function() {}
  

  self.connect = function(hostname, port) {
    conn = new TCPSocket(hostname, port)
    conn.onopen = conn_opened
    conn.onclose = conn_closed
    conn.onread = conn_read
  }


  self.close = function() {
    conn.close()
    self.onclose()
  }


  self.ident = function(nickname, modes, real_name) {
    send("USER", nickname + " " + modes + " :" + real_name) 
  }
     
     
  self.nick = function(nickname) {
    send("NICK", nickname)
  }


  self.join = function(channel) {
    send("JOIN", channel)
  }
  
  
  self.quit = function(reason) {
    send("QUIT", ":" + reason)
    conn.close()
  }
     

  self.privmsg = function(destination, message) {
    send('PRIVMSG', destination + ' :' + message)
  }
 
  // Socket Callbacks
  var conn_opened = function() {
    self.onopen()
  }


  var conn_closed = function() {
    self.onclose()
  }


  var conn_read = function(data) {
    buffer += data
    parse_buffer()
  }
 
  // Internal Functions
  var send = function(type, payload) {
    conn.send(type + " " + payload + ENDL)
  }
 
 
  var parse_buffer= function() {
    var msgs = buffer.split(ENDL)
    buffer = msgs[msgs.length-1]
    
    for (var i=0; i<msgs.length-1; i++)
      dispatch(msgs[i])
  }

  var parse_message = function(s) {       
    var msg = {}
    msg.prefix = ""
    
    if (s[0] == ":") 
    {
      var first_space = s.search(" ")
      msg.prefix = s.slice(0, first_space).slice(1)
      s = s.slice(first_space + 1)
    }
    
    if (s.search(':') != -1) 
    {
      var i = s.search(":")
      var payload = s.slice(i+1)
      s = s.slice(0,i-1)
      msg.args = s.split(' ')
      msg.args.push(payload)
    } 
    else 
    {
      msg.args = s.split(' ')
    }
    
    msg.type = msg.args.shift()
    return msg
  }
  
  
  var dispatch = function(line) {
    msg = parse_message(line)
    switch(msg.type) 
    {
      case "PRIVMSG":
        self.onmessage(msg.prefix, msg.args[0], msg.args.slice(1).join("[]"))
      break

      case "433":
        //ERR_NICKNAMEINUSE
        console.log("nick taken")
        self.onnickInUse()
      break

      case "PING":
        send("PONG", ":" + msg.args)
      break

      default:
      break
    }
  }
}