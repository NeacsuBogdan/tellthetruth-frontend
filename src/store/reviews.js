import { defineStore } from 'pinia';

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: []
  }),
  actions: {
    addReview(review) {
      this.reviews.push(review);
    },
    setReviews(reviews) {
      this.reviews = reviews;
    },
    clearReviews() {
      this.reviews = [];
    },
    markReviewAsReported(reviewId, userId) {
      const review = this.reviews.find(r => r.Id === reviewId);
      if (review) {
        if (!review.ReportedBy) {
          review.ReportedBy = [];
        }
        review.ReportedBy.push(userId);
      }
    },
    unmarkReviewAsReported(reviewId, userId) {
      const review = this.reviews.find(r => r.Id === reviewId);
      if (review && review.ReportedBy) {
        review.ReportedBy = review.ReportedBy.filter(id => id !== userId);
      }
    },
    removeReview(reviewId) {
      this.reviews = this.reviews.filter(review => review.Id !== reviewId);
    }
  },
  getters: {
    getReviewsByLocationId: (state) => (locationId) => {
      return state.reviews.filter(review => review.Id_Locatie === locationId);
    },
    getFilteredReviews: (state) => (filter) => {
      if (!filter.locationId) {
        return [];  // Return empty array if no locationId is provided
      }
      let filteredReviews = state.reviews.filter(review => review.Id_Locatie === filter.locationId);
      const score = filter.score !== undefined ? filter.score : 2; // Default score is 2
      if (filter.scoreCondition === 'upTo') {
        filteredReviews = filteredReviews.filter(review => review.Scor <= score);
      } else if (filter.scoreCondition === 'above') {
        filteredReviews = filteredReviews.filter(review => review.Scor > score);
      }

      // Sortare descrescătoare după dată și oră
      filteredReviews.sort((a, b) => {
        const dateA = new Date(`${a.Data}T${a.Ora}`);
        const dateB = new Date(`${b.Data}T${b.Ora}`);
        return dateB - dateA; // Descrescător
      });

      return filteredReviews;
    }
  }
});
