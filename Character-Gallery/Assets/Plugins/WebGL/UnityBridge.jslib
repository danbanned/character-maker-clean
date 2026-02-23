mergeInto(LibraryManager.library, {
  UnityReady: function () {
    if (typeof window !== 'undefined' && typeof window.UnityReady === 'function') {
      window.UnityReady();
    } else if (typeof console !== 'undefined' && console.warn) {
      console.warn('UnityReady callback missing on window');
    }
  }
});
