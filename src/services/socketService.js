// src/services/socketService.js
import io from 'socket.io-client';
import { showToast } from '../components/ToastContainer';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        this.socket.on('problemUpdated', (data) => {
            showToast(`Problem status updated: ${data.status}`);
            // Trigger UI update through global state management
            window.dispatchEvent(new CustomEvent('problemUpdate', { detail: data }));
        });

        this.socket.on('newProblemNearby', (data) => {
            showToast(`New problem reported nearby: ${data.title}`);
            window.dispatchEvent(new CustomEvent('newProblem', { detail: data }));
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    emitProblemUpdate(problemId, status) {
        if (this.socket) {
            this.socket.emit('updateProblem', { problemId, status });
        }
    }

    joinArea(coordinates) {
        if (this.socket) {
            this.socket.emit('joinArea', coordinates);
        }
    }
}

export default new SocketService();