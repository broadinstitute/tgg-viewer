# TGG-viewer allows its sample lists, settings, and selected tracks to be saved or loaded to/from a json config file. 
# Before you can load settings from such a config file, you have to make it available at a publicly-accessible url. 
# 
# One convenient option is to store the config in a public github repository. Another is to put it in a google storage bucket. 
# If you choose to use a google bucket, the steps below adjust the bucket's settings so that it works with TGG-viewer.
# 
# 1. upload the .json config(s) to gs://your-bucket
# 2. set bucket contents to be public by granting read access to "AllUsers", or,
#    if you chose to enable ACLs when creating your bucket, you can make just the config(s) public by running:
#
#     gsutil acl ch -u AllUsers:R gs://your-bucket/your-config.json
#
# 3. update the bucket's CORS settings by running this script:
#
#     ./enable_cors.sh gs://your-bucket
# 
# 4. paste the config url (eg. https://storage.googleapis.com/your-bucket/path/your-config.json) into the "Initial settings" box in TGG-viewer and click Apply
# 
BUCKET=$1   # eg. "gs://my-bucket"
gsutil cors set <( echo '[{ "origin": ["*"], "method": ["GET"] }]' ) $BUCKET
gsutil cors get $BUCKET
