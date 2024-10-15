function formatTimeAgo(inputDate) {
    const createdAt = new Date(inputDate);
    const now = new Date();
    const diffMs = now - createdAt; // chênh lệch thời gian tính bằng milliseconds
  
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays >= 30) {
      // Nếu hơn 1 tháng, hiển thị ngày tháng năm
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return createdAt.toLocaleDateString(undefined, options);
    } else if (diffDays >= 1) {
      // Nếu hơn 1 ngày, hiển thị số ngày
      return `${diffDays} ngày trước`;
    } else if (diffHours >= 1) {
      // Nếu chưa đến 1 ngày, hiển thị số giờ
      return `${diffHours} giờ trước`;
    } else {
      // Nếu chưa đến 1 giờ, hiển thị số phút
      return `${diffMinutes} phút trước`;
    }
  }

const CommonFunctions = {
    formatTimeAgo
}
export default CommonFunctions;