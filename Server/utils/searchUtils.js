const { Resource } = require('../models');

// Advanced search functionality
class SearchUtils {
  static buildSearchQuery(searchParams) {
    const {
      search,
      course,
      type,
      tags,
      uploader,
      fileType,
      dateFrom,
      dateTo,
      minFileSize,
      maxFileSize,
      minDownloads,
      maxDownloads
    } = searchParams;

    const query = {};
    const andConditions = [];

    // Text search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { course: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Course filtering (supports multiple courses)
    if (course) {
      const courses = Array.isArray(course) ? course : course.split(',').map(c => c.trim());
      andConditions.push({
        course: { $in: courses.map(c => new RegExp(c, 'i')) }
      });
    }

    // Type filtering (supports multiple types)
    if (type) {
      const types = Array.isArray(type) ? type : type.split(',').map(t => t.trim());
      andConditions.push({ type: { $in: types } });
    }

    // Tags filtering (supports multiple tags)
    if (tags) {
      const tagList = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      andConditions.push({
        tags: { $in: tagList.map(t => new RegExp(t, 'i')) }
      });
    }

    // Uploader filtering
    if (uploader) {
      andConditions.push({ uploaderId: uploader });
    }

    // File type filtering
    if (fileType) {
      andConditions.push({ fileType: new RegExp(fileType, 'i') });
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      const dateQuery = {};
      if (dateFrom) dateQuery.$gte = new Date(dateFrom);
      if (dateTo) dateQuery.$lte = new Date(dateTo);
      andConditions.push({ createdAt: dateQuery });
    }

    // File size filtering
    if (minFileSize || maxFileSize) {
      const sizeQuery = {};
      if (minFileSize) sizeQuery.$gte = parseInt(minFileSize);
      if (maxFileSize) sizeQuery.$lte = parseInt(maxFileSize);
      andConditions.push({ fileSize: sizeQuery });
    }

    // Download count filtering
    if (minDownloads || maxDownloads) {
      const downloadQuery = {};
      if (minDownloads) downloadQuery.$gte = parseInt(minDownloads);
      if (maxDownloads) downloadQuery.$lte = parseInt(maxDownloads);
      andConditions.push({ downloadCount: downloadQuery });
    }

    // Combine all conditions
    if (andConditions.length > 0) {
      if (query.$or) {
        query.$and = [{ $or: query.$or }, ...andConditions];
        delete query.$or;
      } else {
        query.$and = andConditions;
      }
    }

    return query;
  }

  static buildSortObject(sortBy = 'createdAt', sortOrder = 'desc') {
    const validSortFields = ['createdAt', 'title', 'downloadCount', 'fileSize', 'course', 'type'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortObj = {};

    sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Add secondary sort by createdAt if not already sorting by it
    if (sortField !== 'createdAt') {
      sortObj.createdAt = -1;
    }

    return sortObj;
  }

  static async getSearchSuggestions(searchTerm, limit = 10) {
    if (!searchTerm || searchTerm.length < 2) {
      return {
        courses: [],
        tags: [],
        titles: []
      };
    }

    const searchRegex = new RegExp(searchTerm, 'i');

    // Get course suggestions
    const courseAggregation = await Resource.aggregate([
      { $match: { course: searchRegex } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, value: '$_id', count: 1 } }
    ]);

    // Get tag suggestions
    const tagAggregation = await Resource.aggregate([
      { $match: { tags: { $in: [searchRegex] } } },
      { $unwind: '$tags' },
      { $match: { tags: searchRegex } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, value: '$_id', count: 1 } }
    ]);

    // Get title suggestions
    const titleAggregation = await Resource.aggregate([
      { $match: { title: searchRegex } },
      { $project: { title: 1, _id: 0 } },
      { $limit: limit },
      { $project: { value: '$title' } }
    ]);

    return {
      courses: courseAggregation,
      tags: tagAggregation,
      titles: titleAggregation
    };
  }

  static async getPopularSearches(limit = 10) {
    // This would typically be stored in a separate collection
    // For now, return popular courses and tags
    const popularCourses = await Resource.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, term: '$_id', count: 1, type: { $literal: 'course' } } }
    ]);

    const popularTags = await Resource.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, term: '$_id', count: 1, type: { $literal: 'tag' } } }
    ]);

    return {
      courses: popularCourses,
      tags: popularTags
    };
  }
}

module.exports = SearchUtils;