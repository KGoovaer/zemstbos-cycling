import { promises as fs } from 'fs'
import path from 'path'

const GPX_DIR = path.join(process.cwd(), 'public', 'gpx-files')

export async function saveGPXFile(routeId: string, gpxContent: string): Promise<string> {
  try {
    await fs.mkdir(GPX_DIR, { recursive: true })
    
    const filename = `${routeId}.gpx`
    const filepath = path.join(GPX_DIR, filename)
    
    await fs.writeFile(filepath, gpxContent, 'utf-8')
    
    return `/gpx-files/${filename}`
  } catch (error) {
    console.error('Error saving GPX file:', error)
    throw new Error('Failed to save GPX file')
  }
}

export async function readGPXFile(routeId: string): Promise<string> {
  try {
    const filename = `${routeId}.gpx`
    const filepath = path.join(GPX_DIR, filename)
    
    const content = await fs.readFile(filepath, 'utf-8')
    return content
  } catch (error) {
    console.error('Error reading GPX file:', error)
    throw new Error('Failed to read GPX file')
  }
}

export async function deleteGPXFile(routeId: string): Promise<void> {
  try {
    const filename = `${routeId}.gpx`
    const filepath = path.join(GPX_DIR, filename)
    
    await fs.unlink(filepath)
  } catch (error) {
    console.error('Error deleting GPX file:', error)
  }
}
