import os,subprocess
from pathlib import Path
base=Path('/tmp/liyuanci-whispers-joint-20261028-r1')
pairs=dict(line.split('=',1) for line in (base/'compose.env').read_text().splitlines())
env=os.environ.copy()
env.update(APP_WHISPER_TEXT_TEST_DSN='host=127.0.0.1 port=18882 user=liyuanci password='+pairs['LIYUANCI_TEST_DB_PASSWORD']+' dbname=liyuanci sslmode=disable connect_timeout=5',APP_WHISPER_REDIS_TEST_ADDRESS='127.0.0.1:18883',APP_WHISPER_SERVER_BINARY=str(Path.cwd()/'bin/server'),APP_WHISPER_CONTENT_BINARY=str(Path.cwd()/'bin/content-worker'),APP_WHISPER_PRIVACY_BINARY=str(Path.cwd()/'bin/privacy-worker'))
with (base/'joint-runtime.log').open('w') as out:
 r=subprocess.run(['go','test','-overlay',str(base/'overlay.json'),'./internal/whisperapp','-run','^TestPostgresWhisperRuntime$','-count=1','-v','-timeout','240s'],env=env,stdout=out,stderr=subprocess.STDOUT)
print((base/'joint-runtime.log').read_text()[-6500:])
raise SystemExit(r.returncode)
