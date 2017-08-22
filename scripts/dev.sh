rm -rf .tmp/views
rm -rf .tmp/public/js
cp -r views .tmp
cp -r assets/js .tmp/public

sails lift