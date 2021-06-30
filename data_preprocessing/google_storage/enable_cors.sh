# If you'd like to put TGG-viewer json configs in a google storage bucket and make them publicly-accessible so that they can be passed in to the "Initial settings" field,
# you can do this by:
# 1. uploading the .json config(s) to your bucket
# 2. setting bucket contents to be public by granting read access to "AllUsers", or,
#    if you chose to enable ACLs when creating your bucket, you can make just the config(s) public by running:
#
#     gsutil acl ch -u AllUsers:R gs://your-bucket/your-config.json
#
# 3. updating CORS settings for the bucket by running this script:
#
#     ./enable_cors.sh gs://you-bucket

BUCKET=$1   # eg. "gs://my-bucket"
gsutil cors set <( echo '[{ "origin": ["*"], "method": ["GET"] }]' ) $BUCKET
gsutil cors get $BUCKET
