(Get-Content 'src\index.css') -replace '(?s)/\* Security: Disable Text Selection \*/.*?user-select: text;\r?\n\}', '' | Set-Content 'src\index.css'
