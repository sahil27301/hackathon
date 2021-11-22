editIcon = (questionUser, loggedUser, questionId, floating = true) => {
  if (
    questionUser._id.toString() == loggedUser._id.toString() ||
    loggedUser.isAdmin
  ) {
    if (floating) {
      return `<a href="/questions/edit/${questionId}" class="btn-floating halfway-fab blue"><i class="fas fa-edit fa-small"></i></a>`;
      // return `<a href="google.com">lol</a>`;
    } else {
      return `<a href="/questions/edit/${questionId}"><i class="fas fa-edit"></i></a>`;
    }
  } else {
    return "";
  }
};

editCommentIcon = (
  commentUser,
  loggedUser,
  questionId,
  floating = true,
  commentId
) => {
  if (
    commentUser._id.toString() == loggedUser._id.toString() ||
    loggedUser.isAdmin
  ) {
    if (floating) {
      return `<a href="/questions/edit/${questionId}/comment/${commentId}" class="btn-floating halfway-fab blue"><i class="fas fa-edit fa-small"></i></a>`;
      // return `<a href="google.com">lol</a>`;
    } else {
      return `<a href="/questions/edit/${questionId}/comment/${commentId}"><i class="fas fa-edit"></i></a>`;
    }
  } else {
    return "";
  }
};

stripTags = (input) => input.replace(/<(?:.|\n)*?>/gm, "");

truncate = (str, len) => {
  if (str.length > len && str.length > 0) {
    let new_str = str + " ";
    new_str = str.substr(0, len);
    new_str = str.substr(0, new_str.lastIndexOf(" "));
    new_str = new_str.length > 0 ? new_str : str.substr(0, len);
    return new_str + "...";
  }
  return str;
};

// module.exports = UtilsController;
module.exports = { editIcon, editCommentIcon, stripTags, truncate };
