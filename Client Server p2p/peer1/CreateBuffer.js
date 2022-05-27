var sha1 = require("sha1");

module.exports = {
  //handler for client
  client: function (data) {
    //buffer declarations and splits
    const headBuffer = data.slice(0, 4);
    const peers = parseBitPacket(headBuffer, 12, 8);
    const msgtype = parseBitPacket(headBuffer, 4, 8);
    const senderNameLength = parseBitPacket(headBuffer, 20, 12);
    const senderName = data.slice(4, 4 + senderNameLength);
    let sto = bytesToString(senderName);

    switch (
      msgtype //determines message type
    ) {
      case 1:
        console.log("Recevied Welcome Message from " + sto);
        return handleDHT(data, peers, senderNameLength);
        break;
      case 2:
        console.log("Recevied Hello Message from " + sto);
        break;
      default:
        console.log("Invalid Message Type");
        break;
    }
  },

  server: function (
    DHT,
    path //server peer handler
  ) {
    //buffer declarations
    const name = path;
    const noOfPeers = DHT.length;
    const nameLenth = name.length;
    const headBuffer = Buffer.alloc(4);
    const senderBytes = stringToBytes(name);
    const senderBuffer = Buffer.from(senderBytes);

    storeBitPacket(headBuffer, 0x7, 0, 4);
    storeBitPacket(headBuffer, 0x1, 4, 8);
    storeBitPacket(headBuffer, noOfPeers, 12, 8);
    storeBitPacket(headBuffer, nameLenth, 20, 12);

    const headlength = headBuffer.length;
    const sendlength = senderBuffer.length;
    //if there are peers creates a 6 byte buffer with the first 4 being the host and the last 2 being the port
    if (noOfPeers != 0) {
      const newBuffer = DHT.map(({ host, port }) => {
        const payLoadBuffer = Buffer.alloc(4);
        storeBitPacket(payLoadBuffer, ipV4StringToInteger(host), 0, 32);

        const portLoadBuffer = Buffer.alloc(2);
        storeBitPacket(portLoadBuffer, parseInt(port), 0, 16);

        const length = payLoadBuffer.length + portLoadBuffer.length;
        const buffer = Buffer.concat([payLoadBuffer, portLoadBuffer], length);

        return buffer;
      }); //concatenates all the buffers
      const finalBuffer = Buffer.concat(newBuffer);
      const lengthPayload = finalBuffer.length;
      const totalLength = lengthPayload + headlength + sendlength;
      const deliveryBuffer = Buffer.concat(
        [headBuffer, senderBuffer, finalBuffer],
        totalLength
      );
      return deliveryBuffer;
    } else {
      //concatenates all the buffers
      const totalLength = headlength + sendlength;
      const deliveryBuffer = Buffer.concat(
        [headBuffer, senderBuffer],
        totalLength
      );
      return deliveryBuffer;
    }
  },
};
//this function takes the dht payload and converts it into something readable to print out
function handleDHT(data, peers, senderNameLength) {
  if (peers < 1) {
    console.log("Along with DHT: []");
  } else {
    const payload = data.slice(4 + senderNameLength);

    let bufferarray = [];
    let count = 0;
    let recivedDHT = [[]];

    for (let i = 0; i < peers * 6; i += 6) {
      bufferarray[count] = payload.slice(i, i + 6);
      count++;
    }
    for (let x = 0; x < bufferarray.length; x++) {
      const splitArrayhost = bufferarray[x].slice(0, 4);
      const splitArrayPort = bufferarray[x].slice(4, 6);
      recivedDHT[x] = [
        "[" +
          intToIP(parseBitPacket(splitArrayhost, 0, 32)) +
          ":" +
          parseBitPacket(splitArrayPort, 0, 16),
        sha1(
          intToIP(parseBitPacket(splitArrayhost, 0, 32)) +
            ":" +
            parseBitPacket(splitArrayPort, 0, 16)
        ) +
          "]" +
          "\n",
      ];
    }
    console.log("Along with DHT: " + recivedDHT);

    return recivedDHT;
  }
}

function printPacketBit(packet) {
  //shamelessly stole this from assignment 1
  var bitString = "";

  for (var i = 0; i < packet.length; i++) {
    // To add leading zeros
    var b = "00000000" + packet[i].toString(2);
    // To print 4 bytes per line
    if (i > 0 && i % 4 == 0) bitString += "\n";
    bitString += " " + b.substr(b.length - 8);
  }
  console.log(bitString);
}

//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
  //shamelessly stole this from assignment 1
  // let us get the actual byte position of the offset
  let lastBitPosition = offset + length - 1;
  let number = value.toString(2);
  let j = number.length - 1;
  for (var i = 0; i < number.length; i++) {
    let bytePosition = Math.floor(lastBitPosition / 8);
    let bitPosition = 7 - (lastBitPosition % 8);
    if (number.charAt(j--) == "0") {
      packet[bytePosition] &= ~(1 << bitPosition);
    } else {
      packet[bytePosition] |= 1 << bitPosition;
    }
    lastBitPosition--;
  }
}

// Convert a given string to byte array
function stringToBytes(str) {
  //shamelessly stole this from assignment 1
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

const ipV4StringToInteger = function (string) {
  //takes an ipv4 string and converts it to an integer
  var parts = string.split(".");

  var sum = 0;

  for (var i = 0; i < 4; i++) {
    var partVal = Number(parts[i]);
    sum = (sum << 8) + partVal;
  }

  return sum;
};

function parseBitPacket(packet, offset, length) {
  //shamelessly stole this from assignment 1
  let number = "";
  for (var i = 0; i < length; i++) {
    // let us get the actual byte position of the offset
    let bytePosition = Math.floor((offset + i) / 8);
    let bitPosition = 7 - ((offset + i) % 8);
    let bit = (packet[bytePosition] >> bitPosition) % 2;
    number = (number << 1) | bit;
  }
  return number;
}

function intToIP(int) {
  //takes an integer and converts it to an ipv4 string
  var part1 = int & 255;
  var part2 = (int >> 8) & 255;
  var part3 = (int >> 16) & 255;
  var part4 = (int >> 24) & 255;

  return part4 + "." + part3 + "." + part2 + "." + part1;
}

function bytesToString(array) {
  //shamelessly stole this from assignment 1
  var result = "";
  for (var i = 0; i < array.length; ++i) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}
