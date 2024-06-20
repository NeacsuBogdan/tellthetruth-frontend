import { defineStore } from 'pinia';

export const useReportsStore = defineStore('reports', {
  state: () => ({
    locationReports: [],
    reviewReports: []
  }),
  actions: {
    setLocationReports(reports) {
      this.locationReports = reports;
    },
    setReviewReports(reports) {
      this.reviewReports = reports;
    },
    addReport(report) {
      if (report.isReview) {
        this.reviewReports.push({
          Id_Utilizator: report.id,
          ReporterName: report.userName,
          Id_Recenzie: report.reviewId,
          LocationId: report.locationId,
          LocationName: report.locationName,
          Data: new Date(report.date).toISOString(),
          Motiv: report.reason
        });
      } else {
        this.locationReports.push({
          Id_Utilizator: report.id,
          ReporterName: report.userName,
          Id_Locatie: report.locationId,
          LocationName: report.locationName,
          Data: new Date(report.date).toISOString(),
          Motiv: report.reason
        });
      }
    },
    removeLocationReport(userId, locationId) {
      this.locationReports = this.locationReports.filter(report => {
        return !(report.Id_Utilizator === userId && report.Id_Locatie === locationId);
      });
    },
    removeReviewReport(userId, reviewId) {
      this.reviewReports = this.reviewReports.filter(report => {
        return !(report.Id_Utilizator === userId && report.Id_Recenzie === reviewId);
      });
    }
  },
  getters: {
    totalReports: (state) => state.locationReports.length + state.reviewReports.length,
    getLocationReports: (state) => {
      return state.locationReports.map(report => ({
        id: report.Id_Utilizator,
        userName: report.ReporterName,
        locationName: report.LocationName,
        date: new Date(report.Data).toLocaleDateString('ro-RO'),
        reason: report.Motiv,
        isReview: false
      }));
    },
    getReviewReports: (state) => {
      return state.reviewReports.map(report => ({
        id: report.Id_Utilizator,
        userName: report.ReporterName,
        locationName: report.LocationName,
        date: new Date(report.Data).toLocaleDateString('ro-RO'),
        reason: report.Motiv,
        reviewId: report.Id_Recenzie,
        isReview: true
      }));
      
    },
    getAllReports: (state) => {
      const locationReports = state.locationReports.map(report => ({
        id: report.Id_Utilizator,
        userName: report.ReporterName,
        locationId: report.Id_Locatie,
        locationName: report.LocationName,
        date: new Date(report.Data).toLocaleDateString('ro-RO'),
        reason: report.Motiv,
        isReview: false
      }));
      const reviewReports = state.reviewReports.map(report => ({
        id: report.Id_Utilizator,
        userName: report.ReporterName,
        locationId: report.LocationId,
        locationName: report.LocationName,
        date: new Date(report.Data).toLocaleDateString('ro-RO'),
        reason: report.Motiv,
        reviewId: report.Id_Recenzie,
        isReview: true
      }));
      return [...locationReports, ...reviewReports];
    }
  }
});
