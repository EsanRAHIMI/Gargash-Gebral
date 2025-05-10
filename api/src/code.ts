// /api/src/code.ts
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import router from './auth/auth.routes';

// Define AuthRequest interface
interface AuthRequest extends Request {
  user?: any;
  session?: {
    codeBrowserAuth?: string;
  };
}

export default router;


// Project root directories
type ProjectType = 'api' | 'ai' | 'frontend' | 'project';
const rootPaths: Record<ProjectType, string> = {
  'ai': path.resolve(__dirname, '..', '..', 'ai'),
  'api': path.resolve(__dirname, '..'),
  'frontend': path.resolve(__dirname, '..', '..', 'frontend'),
  'project': path.resolve(__dirname, '..', '..')
};

// Simple password protection for development
const CODE_BROWSER_PASSWORD = process.env.CODE_BROWSER_PASSWORD || '1'; // Set a default password

// Middleware for simple password protection
const simpleAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Check if user is already authenticated with JWT
  if (req.user) {
    return next();
  }
  
  // Check if password is provided in query or stored in session
  const providedPassword = req.query.password || req.session?.codeBrowserAuth;
  
  if (!providedPassword) {
    return renderLoginPage(res);
  }
  
  if (providedPassword === CODE_BROWSER_PASSWORD) {
    // Store auth in session if sessions are available
    if (req.session) {
      req.session.codeBrowserAuth = providedPassword;
    }
    return next();
  } else {
    return renderLoginPage(res, 'Invalid password');
  }
};

// Function to render login page
function renderLoginPage(res: Response, errorMessage: string | null = null) {
  const htmlResponse = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code Browser - Login</title>
      <style>
        :root {
          --bg-color: #121212;
          --text-color: #f0f0f0;
          --accent-color: #007bff;
          --error-color: #dc3545;
          --border-color: #454d55;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: var(--bg-color);
          color: var(--text-color);
          line-height: 1.6;
          padding: 20px;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        
        .login-container {
          background-color: #1e1e1e;
          padding: 30px;
          border-radius: 8px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
          color: var(--accent-color);
          margin-top: 0;
          text-align: center;
        }
        
        form {
          display: flex;
          flex-direction: column;
        }
        
        input {
          background-color: #2a2a2a;
          color: var(--text-color);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 16px;
        }
        
        button {
          background-color: var(--accent-color);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }
        
        button:hover {
          background-color: #0069d9;
        }
        
        .error-message {
          color: var(--error-color);
          margin-bottom: 15px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <h1>AI Hackathon Code Browser</h1>
        ${errorMessage ? `<div class="error-message">${errorMessage}</div>` : ''}
        <form method="GET" action="/api/code">
          <input type="password" name="password" placeholder="Enter password" required>
          <button type="submit">Access Code Browser</button>
        </form>
      </div>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(401).send(htmlResponse);
}

// Excluded directories and files
const excludedDirs = [
  'node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 
  '.DS_Store', 'package-lock.json', 'uploads', 'coverage', '.yarn',
  'yarn.lock', '.pnp.cjs', '.pnp.loader.mjs', 'install-state.gz', 'code.js', '.gitignore', 'venv'

];

// Included file extensions
const includedExtensions = [
  '.js', '.json', '.md', '.html', '.css', '.jsx', '.ts', '.tsx',
  '.py', '.yml', '.yaml', '.env.example', '.gitignore', '.eslintrc',
  '.prettierrc', '.babelrc'
];

// Helper function to check if a file should be included
function shouldIncludeFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  // Include files with extensions in the list or files without extension but with specific names
  return includedExtensions.includes(ext) || 
         (ext === '' && ['.env.example', '.gitignore', '.eslintrc', '.prettierrc', '.babelrc']
                         .some(name => filePath.toLowerCase().endsWith(name)));
}

// Get all files in a directory recursively
function getAllFiles(dirPath: string, arrayOfFiles: string[] = [], maxDepth = 10, currentDepth = 0): string[] {
  if (!fs.existsSync(dirPath) || currentDepth >= maxDepth) return arrayOfFiles;

  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach(file => {
    if (excludedDirs.includes(file.name)) return;

    const fullPath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles, maxDepth, currentDepth + 1);
    } else if (shouldIncludeFile(fullPath)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Generate directory structure with depth limit
interface DirectoryNode {
  name: string;
  type: 'directory' | 'file';
  children?: DirectoryNode[];
  path: string;
  extension?: string;
}

function getDirectoryStructure(dirPath: string, maxDepth = 5, currentDepth = 0): DirectoryNode[] {
  if (!fs.existsSync(dirPath) || currentDepth >= maxDepth) return [];

  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    return files
      .filter(file => !excludedDirs.includes(file.name))
      .map(file => {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
          const children = getDirectoryStructure(fullPath, maxDepth, currentDepth + 1);
          return { name: file.name, type: 'directory', children, path: fullPath };
        }
        return { 
          name: file.name, 
          type: 'file', 
          path: fullPath,
          extension: path.extname(file.name).substring(1) // Remove the dot
        };
      });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

// Generate tree view for rendering
function generateTree(nodes: DirectoryNode[], prefix = ''): string {
  return nodes
    .map((node, index, array) => {
      const isLast = index === array.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const subPrefix = prefix + (isLast ? '    ' : '│   ');

      if (node.type === 'directory') {
        return `${prefix}${connector}${node.name}/\n${generateTree(node.children || [], subPrefix)}`;
      }
      return `${prefix}${connector}${node.name}`;
    })
    .join('\n');
}

// @route   GET api/code
// @desc    Get code browser main page
// @access  Private with password fallback
router.get('/', simpleAuth, (req: AuthRequest, res: Response) => {
  try {
    const { project = 'backend', directory, search } = req.query;
    const projectStr = project as ProjectType;
    const directoryStr = directory as string | undefined;
    const searchStr = search as string | undefined;
    
    // Validate selected project
    if (!rootPaths[projectStr]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project selected' 
      });
    }
    
    const selectedRootPath = rootPaths[projectStr];
    
    // Process directory parameter
    let currentDir = directoryStr ? path.join(selectedRootPath, directoryStr) : selectedRootPath;
    
    // Security check - prevent directory traversal attempts
    if (!path.normalize(currentDir).startsWith(selectedRootPath)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid directory path' 
      });
    }
    
    // Get directory structure for selected project
    const directoryStructure = getDirectoryStructure(selectedRootPath);
    const directoryTree = generateTree(directoryStructure);
    
    // Get all files based on the current directory
    let allFiles: string[] = [];
    if (directoryStr) {
      if (fs.existsSync(currentDir)) {
        allFiles = getAllFiles(currentDir);
      }
    } else {
      allFiles = getAllFiles(selectedRootPath);
    }
    
    // Process file contents
    const fileContents = allFiles.map(file => {
      try {
        const relativePath = path.relative(selectedRootPath, file);
        const content = fs.readFileSync(file, 'utf-8');
        return { file: relativePath, fullPath: file, content };
      } catch (error) {
        return { 
          file: path.relative(selectedRootPath, file), 
          fullPath: file,
          content: 'Error: Cannot read file' 
        };
      }
    });
    
    // Filter files based on search query
    let filteredFiles = fileContents;
    if (searchStr) {
      const lowerSearch = searchStr.toLowerCase();
      filteredFiles = fileContents.filter(
        file => 
          file.file.toLowerCase().includes(lowerSearch) ||
          file.content.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Get available top-level directories (for dropdown)
    const topDirs = fs.readdirSync(selectedRootPath, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && !excludedDirs.includes(entry.name))
      .map(dir => dir.name);
    
    // Render HTML response
    const htmlResponse = generateHtmlResponse(
      projectStr,
      topDirs,
      directoryStr || null,
      searchStr || null,
      directoryTree,
      filteredFiles
    );
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse);
    
  } catch (err: unknown) {
    console.error('Code browser error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (err as Error).stack : undefined
    });
  }
});

// @route   GET api/code/download
// @desc    Download a file
// @access  Private with password fallback
router.get('/download', simpleAuth, (req: AuthRequest, res: Response) => {
  try {
    const { project = 'backend', file } = req.query;
    const projectStr = project as ProjectType;
    const fileStr = file as string | undefined;
    
    // Validate selected project
    if (!rootPaths[projectStr]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project selected' 
      });
    }
    
    const selectedRootPath = rootPaths[projectStr];
    
    if (!fileStr) {
      return res.status(400).json({ 
        success: false, 
        message: 'File path is required' 
      });
    }
    
    const filePath = path.join(selectedRootPath, fileStr);
    
    // Security check - prevent directory traversal attempts
    if (!path.normalize(filePath).startsWith(selectedRootPath)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file path' 
      });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    
    res.download(filePath);
    
  } catch (err: unknown) {
    console.error('File download error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (err as Error).stack : undefined
    });
  }
});

// Function to generate HTML response
function generateHtmlResponse(
  selectedProject: string,
  topDirs: string[],
  currentDir: string | null,
  searchQuery: string | null,
  directoryTree: string,
  files: Array<{ file: string; fullPath: string; content: string }>
): string {
  // Project options for dropdown
  const projectOptions = Object.keys(rootPaths)
    .map(project => `<option value="${project}" ${project === selectedProject ? 'selected' : ''}>${project.charAt(0).toUpperCase() + project.slice(1)}</option>`)
    .join('');
  
  // Directory options for dropdown
  const directoryOptions = topDirs
    .map(dir => `<option value="${dir}" ${dir === currentDir ? 'selected' : ''}>${dir}</option>`)
    .join('');
  
  // Format files section
  const formattedFiles = files
    .map(file => {
      // Determine syntax highlighting class based on file extension
      const extension = path.extname(file.file).substring(1) || 'txt';
      
      return `
        <div class="file-container">
          <h3 class="file-header">
            <span class="file-icon">📄</span> ${file.file}
            <a href="/api/code/download?project=${selectedProject}&file=${encodeURIComponent(file.file)}" class="download-link">
              <span class="download-icon">📥</span>
            </a>
          </h3>
          <pre class="code-block"><code class="language-${extension}">${escapeHtml(file.content)}</code></pre>
        </div>
      `;
    })
    .join('');
  
  // HTML template
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Hackathon Code Browser</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/monokai.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
      <script>
        // Add these language aliases to ensure proper highlighting
        hljs.registerAliases('ts', { languageName: 'typescript' });
        hljs.registerAliases('js', { languageName: 'javascript' });
        hljs.registerAliases('py', { languageName: 'python' });
        hljs.registerAliases('jsx', { languageName: 'javascript' });
        hljs.registerAliases('tsx', { languageName: 'typescript' });
        hljs.registerAliases('md', { languageName: 'markdown' });
        
        document.addEventListener('DOMContentLoaded', (event) => {
          hljs.highlightAll();
        });
      </script>
      <style>
        :root {
          --bg-color: #121212;
          --text-color: #f0f0f0;
          --accent-color: #007bff;
          --secondary-color: #28a745;
          --header-color: #343a40;
          --border-color: #454d55;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: var(--bg-color);
          color: var(--text-color);
          line-height: 1.6;
          padding: 20px;
          margin: 0;
        }
        
        h1, h2, h3 {
          color: var(--accent-color);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 20px;
        }
        
        .controls {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        select, input, button {
          background-color: #2a2a2a;
          color: var(--text-color);
          border: 1px solid var(--border-color);
          padding: 8px 12px;
          border-radius: 4px;
        }
        
        button {
          cursor: pointer;
          background-color: var(--accent-color);
          transition: background-color 0.3s;
        }
        
        button:hover {
          background-color: #0069d9;
        }
        
        .tree-container {
          background-color: #1e1e1e;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 20px;
          overflow-x: auto;
          max-height: 400px;
        }
        
        .tree-view {
          font-family: monospace;
          white-space: pre;
          color: #66c2ff;
        }
        
        .files-container {
          margin-top: 30px;
        }
        
        .file-container {
          margin-bottom: 30px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          overflow: hidden;
        }
        
        .file-header {
          display: flex;
          align-items: center;
          background-color: var(--header-color);
          padding: 10px 15px;
          margin: 0;
          color: var(--secondary-color);
        }
        
        .file-icon {
          margin-right: 10px;
        }
        
        .download-link {
          margin-left: auto;
          color: var(--text-color);
          text-decoration: none;
        }
        
        .download-icon {
          font-size: 1.2em;
        }
        
        .code-block {
          margin: 0;
          padding: 15px;
          overflow-x: auto;
          background-color: #1a1a1a;
          border-radius: 0;
          max-height: 600px;
        }
        
        .breadcrumb {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          background-color: #1e1e1e;
          padding: 8px 15px;
          border-radius: 4px;
        }
        
        .breadcrumb a {
          color: var(--accent-color);
          text-decoration: none;
          margin: 0 5px;
        }
        
        .breadcrumb a:hover {
          text-decoration: underline;
        }
        
        .breadcrumb-separator {
          color: var(--border-color);
          margin: 0 5px;
        }

        .file-count {
          color: #ffc107;
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .controls {
            flex-direction: column;
          }
          
          .control-group {
            flex-wrap: wrap;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📁 AI Hackathon Code Browser</h1>
        </div>
        
        <div class="controls">
          <div class="control-group">
            <label for="project-select">Project:</label>
            <select id="project-select" onchange="updateProject()">
              ${projectOptions}
            </select>
          </div>
          
          <div class="control-group">
            <label for="directory-select">Directory:</label>
            <select id="directory-select" onchange="updateDirectory()">
              <option value="">Root Directory</option>
              ${directoryOptions}
            </select>
          </div>
          
          <div class="control-group">
            <label for="search-input">Search:</label>
            <input 
              type="text" 
              id="search-input" 
              value="${searchQuery || ''}" 
              placeholder="Search files or content..."
            />
            <button onclick="searchFiles()">🔍 Search</button>
          </div>
        </div>
        
        <div class="breadcrumb">
          <a href="/api/code?project=${selectedProject}">📂 ${selectedProject.charAt(0).toUpperCase() + selectedProject.slice(1)}</a>
          ${currentDir ? `<span class="breadcrumb-separator">›</span> <span>${currentDir}</span>` : ''}
        </div>
        
        <h2>Project Structure</h2>
        <div class="tree-container">
          <div class="tree-view">${directoryTree}</div>
        </div>
        
        <h2>Files Content</h2>
        <p class="file-count">Showing ${files.length} file(s)</p>
        <div class="files-container">
          ${formattedFiles || '<p>No files to display</p>'}
        </div>
      </div>
      
      <script>
        function updateProject() {
          const selectedProject = document.getElementById('project-select').value;
          const currentPassword = new URLSearchParams(window.location.search).get('password');
          
          let url = '/api/code?';
          if (currentPassword) url += 'password=' + encodeURIComponent(currentPassword) + '&';
          url += 'project=' + encodeURIComponent(selectedProject);
          
          window.location.href = url;
        }
        
        function updateDirectory() {
          const selectedProject = document.getElementById('project-select').value;
          const selectedDirectory = document.getElementById('directory-select').value;
          const searchQuery = document.getElementById('search-input').value;
          const currentPassword = new URLSearchParams(window.location.search).get('password');
          
          let url = '/api/code?';
          if (currentPassword) url += 'password=' + encodeURIComponent(currentPassword) + '&';
          url += 'project=' + encodeURIComponent(selectedProject);
          if (selectedDirectory) url += '&directory=' + encodeURIComponent(selectedDirectory);
          if (searchQuery) {
            url += '&search=' + encodeURIComponent(searchQuery);
          }
          
          window.location.href = url;
        }
        
        function searchFiles() {
          const selectedProject = document.getElementById('project-select').value;
          const selectedDirectory = document.getElementById('directory-select').value;
          const searchQuery = document.getElementById('search-input').value;
          const currentPassword = new URLSearchParams(window.location.search).get('password');
          
          let url = '/api/code?';
          if (currentPassword) url += 'password=' + encodeURIComponent(currentPassword) + '&';
          url += 'project=' + encodeURIComponent(selectedProject);
          if (selectedDirectory) url += '&directory=' + encodeURIComponent(selectedDirectory);
          if (searchQuery) {
            url += '&search=' + encodeURIComponent(searchQuery);
          }
          
          window.location.href = url;
        }
        
        // Handle Enter key press in search input
        document.getElementById('search-input').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            searchFiles();
          }
        });
      </script>
    </body>
    </html>
  `;
}

// Helper function to escape HTML special characters
function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = router;