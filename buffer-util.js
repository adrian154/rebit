class BufferBuilder {

    constructor() {
        this.buffers = [];
    }

    putBuffer(buf) {
        this.buffers.push(buf);
    }

    putInt32LE(value) {
        const buf = Buffer.alloc(4);
        buf.writeInt32LE(value);
        this.buffers.push(buf);
    }

    putUint32LE(value) {
        const buf = Buffer.alloc(4);
        buf.writeUInt32LE(value);
        this.buffers.push(buf);
    }


    build() {
        return Buffer.concat(this.buffers);
    }

};

class BufferReader {

    constructor(buffer) {
        this.buffer = buffer;
        this.offset = 0;
    }

    moveTo(offset) {
        if(offset >= this.buffer.length) {
            throw new Error("Can't move to position outside of buffer");
        }
        this.offset = offset;
    }

    advance(bytes) {
        const before = this.offset;
        this.offset += bytes;
        return before;
    }

    readUint32LE() {
        return this.buffer.readUint32LE(this.advance(4));
    }   
    
    readInt32LE() {
        return this.buffer.readInt32LE(this.advance(4));
    }

    // important: this is a 
    readBuffer(length) {
        return Buffer.from(this.buffer.slice(this.advance(length), this.offset));
    }

};

x = new BufferReader(Buffer.from([0xff, 0xab, 0x73, 0xae]));
y = x.readBuffer(2);
y[1] = 5;

console.log(x, y);

module.exports = {BufferBuilder, BufferReader};