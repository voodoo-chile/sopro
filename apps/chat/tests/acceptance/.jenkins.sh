
sudo /etc/init.d/xvfb start

sudo /etc/init.d/selenium start

# lift the vertx app
~/vert.x-2.1.5/bin/vertx run server.js &

sleep 5

sudo npm start &

sleep 5

# run protractor GUI tests
sudo npm run acceptance

# stop vertx
pkill -n java

pkill -n node
