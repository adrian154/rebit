class SocketWrapper {

    constructor(socket) {
        
        this.socket = socket;
        this.buffer = null;

        // set up event handlers

        this.socket.on("ready", () => {
            if(this.resolveOnReady) this.resolveOnReady();
        });

        // destroy socket on timeout (cleanup handled via close event)
        this.socket.on("timeout", () => {
            this.socket.destroy();
        });

        this.socket.on("close", () => {
            if(this.rejectOnReady) this.rejectOnReady(new Error("Socket closed"));
            if(this.rejectRead) this.rejectRead(new Error("Socket closed"));
        });

        this.socket.on("data", (data) => {
            
            if(this.buffer) {
                this.buffer = Buffer.concat([this.buffer, data]);
            } else {
                this.buffer = data;
            }

            if(this.bytesToRead && this.buffer.length >= this.bytesToRead) {
                const data = this.buffer.slice(0, this.bytesToRead);
                this.buffer = this.buffer.slice(this.bytesToRead, this.buffer.length);
                this.bytesToRead = null;
                this.resolveRead(data);
            }

        });

    }

    write(data) {
        this.socket.write(data);
    }

    async awaitReady() {
        if(this.resolveOnReady) throw new Error("awaitReady() already called!");
        return (this.socket.readyState === "open") || new Promise((resolve, reject) => {
            this.resolveOnReady = resolve;
            this.rejectOnReady = reject;
        });
    }

    async read(count) {
        
        if(this.bytesToRead) throw new Error("read() already called!");
        
        // check if requested bytes are present already
        if(this.buffer?.length >= count) {
            const data = this.buffer.slice(0, count);
            this.buffer = this.buffer.slice(count, this.buffer.length);
            return data;
        }

        // otherwise, set up promise
        this.bytesToRead = count;
        return new Promise((resolve, reject) => {
            this.resolveRead = resolve;
            this.rejectRead = reject;
        });

    }

};

module.exports = {SocketWrapper};