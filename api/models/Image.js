module.exports = {
  attributes: {
        // uuid
    name: 'string',

        // original name
    fileName: 'string',

        // file size
    size: 'integer',

        // local file
    fd: 'string',

        // {width: 120, height: 90}
    dimension: 'json',

        // 1. local  2. trashed  3. active
    fileStatus: 'string'
  }
}
