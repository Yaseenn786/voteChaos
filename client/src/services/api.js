const API_URL = 'http://localhost:5050/api'; // Change to your backend URL

export const api = {
  // User endpoints
  async getProfile() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async updateNickname(nickname) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nickname })
    });
    return response.json();
  },

  // Game endpoints
  async createRoom(roomData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/game/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roomData)
    });
    return response.json();
  },

  async joinRoom(roomCode) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/game/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roomCode })
    });
    return response.json();
  }
};