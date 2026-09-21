!macro customInit
  nsExec::Exec 'taskkill /F /IM backend-engine.exe /T'
  nsExec::Exec 'taskkill /F /IM CapShorts.exe /T'
!macroend

!macro customInstall
  nsExec::Exec 'taskkill /F /IM backend-engine.exe /T'
!macroend
