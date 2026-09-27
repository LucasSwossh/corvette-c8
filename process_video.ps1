$ffmpeg = "C:\Users\lucas\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
$ffprobe = "C:\Users\lucas\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffprobe.exe"

$inputFile = "c:\Projetos\corvette\Layered_view_black_Corvette_C8_20260925233939.mp4"
$outputFile = "c:\Projetos\corvette\public\corvette_scroll.mp4"
$rawFile = "c:\Projetos\corvette\public\corvette_scroll_raw.mp4"

Copy-Item -Path $inputFile -Destination $rawFile -Force
Write-Output "Copied raw file to $rawFile ($((Get-Item $rawFile).Length) bytes)"

Write-Output "Running ffmpeg re-encode with -nostdin..."
& $ffmpeg -nostdin -y -i $inputFile -c:v libx264 -preset veryfast -crf 18 -g 1 -pix_fmt yuv420p -movflags +faststart -an $outputFile 2>&1 | Select-Object -Last 10

if (Test-Path $outputFile) {
    Write-Output "SUCCESS! Re-encoded file size: $((Get-Item $outputFile).Length) bytes"
} else {
    Write-Output "Output file not found."
}
