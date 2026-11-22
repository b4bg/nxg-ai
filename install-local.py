from pathlib import Path
import shutil,plistlib,subprocess,os
project=Path(__file__).resolve().parent.parent
home=Path.home(); runtime=home/'Library/Application Support/NXG'; agents=home/'Library/LaunchAgents'; logs=home/'Library/Logs/NXG'
for p in [runtime/'bin',runtime/'src',runtime/'scripts',agents,logs]:p.mkdir(parents=True,exist_ok=True)
shutil.copy2('/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node',runtime/'bin/node')
for f in ['src/index.html','src/app.js','src/server.mjs','scripts/local-server.mjs']:shutil.copy2(project/f,runtime/f)
ollama=home/'Applications/Ollama.app/Contents/Resources/ollama'
services=[('com.nxg.ollama',[str(ollama),'serve'],{'OLLAMA_HOST':'127.0.0.1:11434','OLLAMA_NO_CLOUD':'1','OLLAMA_NUM_PARALLEL':'1','OLLAMA_MAX_LOADED_MODELS':'1'}),('com.nxg.assistant',[str(runtime/'bin/node'),str(runtime/'scripts/local-server.mjs')],{})]
for label,args,env in services:
 if label=='com.nxg.ollama' and not ollama.exists():continue
 p=agents/(label+'.plist')
 data={'Label':label,'ProgramArguments':args,'WorkingDirectory':str(runtime),'RunAtLoad':True,'KeepAlive':True,'ThrottleInterval':5,'EnvironmentVariables':env,'StandardOutPath':str(logs/(label+'.log')),'StandardErrorPath':str(logs/(label+'.error.log'))}
 p.write_bytes(plistlib.dumps(data));p.chmod(0o644)
 subprocess.run(['launchctl','bootout',f'gui/{os.getuid()}',str(p)],capture_output=True)
 subprocess.run(['launchctl','bootstrap',f'gui/{os.getuid()}',str(p)],check=True)
print('NXG and Ollama installed as login services. URL: http://localhost:4174')
