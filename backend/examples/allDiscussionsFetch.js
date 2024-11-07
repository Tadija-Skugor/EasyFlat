import axios from 'axios';

class DiscussionService {
  constructor() {
    this.baseUrl = '/discussionData/allDiscussions';
  }

  async fetchDiscussions(brojZatrazenihDiskusija) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: { brojZatrazenihDiskusija },
      });

      const discussions = response.data;
      console.log(discussions);
      return discussions;
    } catch (error) {
      console.error("Error fetching discussions:", error);
      throw error;
    }
  }
}

const discussionService = new DiscussionService();
discussionService.fetchDiscussions(10); 
