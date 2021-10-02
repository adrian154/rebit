class BufferBuilder {

    constructor() {
        this.buffers = [];
    }

    putBuffer(buf) {
        this.buffers.push(buf);
        return this;
    }

    putInt32LE(value) {
        const buf = Buffer.alloc(4);
        buf.writeInt32LE(value);
        this.buffers.push(buf);
        return this;
    }

    putUInt32LE(value) {
        const buf = Buffer.alloc(4);
        buf.writeUInt32LE(value);
        this.buffers.push(buf);
        return this;
    }

    // TODO: 64-bit integer handling
    putVarInt(value) {
        if(value < 0xFD)       { this.buffers.push(Buffer.from([value])); return this; }
        if(value < 0xFFFF)     { this.buffers.push(Buffer.from([0xFD, value & 0xff, (value >> 8) & 0xff])); return this; }
        if(value < 0xFFFFFFFF) { this.buffers.push(Buffer.from([0xFE, value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff])); return this; }
        throw new Error("64-bit integers not yet supported!");
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

    readUInt8()    { return this.buffer.readUInt8(this.advance(1)); }
    readInt32LE()  { return this.buffer.readInt32LE(this.advance(4)); }
    readUInt32LE() { return this.buffer.readUint32LE(this.advance(4)); }   

    // Copy the buffer to avoid inadvertent modifications (see Buffer#slice())
    readBuffer(length) {
        return Buffer.from(this.buffer.slice(this.advance(length), this.offset));
    }

    readVarInt() {
        const first = this.readUInt8();
        if(first < 0xFD) return first;
        if(first < 0xFE) return this.readUInt8() | (this.readUInt8() << 8);
        if(first < 0xFF) return this.readUInt8() | (this.readUInt8() << 8) | (this.readUInt8() << 16) | (this.readUInt8() << 24);
        throw new Error("64-bit integers not yet supported!");
    }

};

module.exports = {BufferBuilder, BufferReader};