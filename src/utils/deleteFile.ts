import fs from 'fs';

const deleteFile = (path: string, name = "file") => {
  fs.unlink(path, (err) => {
    console.log(`deleted ${name}`)
    if (err) {
      console.log(`error deleting ${name}`)
      console.error(err)
      return
    }
  })
}

export default deleteFile;