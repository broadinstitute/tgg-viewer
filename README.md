https://tgg-viewer.broadinstitute.org

The Translational Genomics Group (TGG) Viewer is a free, open-source web app for visualizing splice junctions, expression, and other sequencing data genome-wide using [IGV.js](https://github.com/igvteam/igv.js)

### Features:
- Supports these file formats: .bigWig, .junctions.bed.gz, .vcf, .bam, .cram.
- Includes reference tracks from GTEx v8 muscle, blood, and fibroblast samples.
- Lets you display data files or reference tracks from any Google bucket to which you have read-access.
- Retrieves just the on-screen sections of the files directly from Google buckets.
- Allows gene or locus lists to be added to side bars for quick navigation across a list of regions.


### Settings File Format:

```
{
    "genome": "hg38",    // "hg19" or "hg38"
    "locus": "chr15:92,835,700-93,031,800",   // initial IGV.js locus  
    "bamOptions": {            // IGV.js bam track options
        "trackHeight": 200,
        "viewAsPairs": false,
        "showSoftClips": true,
        "alignmentShading": "strand"
    },
    "sjOptions": {              // IGV.js splice junctions track options
        "trackHeight": 170,
        "colorBy": "strand",
	"colorByNumReadsThreshold": 5,
        "thicknessBasedOn": "numUniqueReads",
        "bounceHeightBasedOn": "random",
        "labelWith": "uniqueReadCount",
        "showOnlyPlusStrand": false,
        "showOnlyMinusStrand": false,
        "hideAnnotated": false,
        "hideUnannotated": false,
        "minUniquelyMappedReads": 0,
        "minTotalReads": 1,
        "maxFractionMultiMappedReads": 1,
        "minSplicedAlignmentOverhang": 0
    },
    "vcfOptions": {         // IGV.js vcf track options
        "displayMode": "EXPANDED"
    },
    "selectedRowNamesByCategoryName": {
        0: [],
        1: []
    },
    "rowsInCategories": [
        {
            "categoryName": "Reference Data",
            "rows": [
                { 
                    "name": "row1", 
                    "data": [
                        { "url": "gs://../file.bam", "type": "alignment", "label": "l" },  // * "type" and "label" are optional
                        { "url": "gs://../file2.bed", "type": "bed", "label": "l2" },
                    ],
                }
            ]
        },
        {
            "categoryName": "gCNV Batches",
            "rows": [
                {
                    "name": "gCNV batch1"
                    "data": [
                        { "type": "gCNV_bed",  "url": "gs://../file2.bed", "samples": [ "sample1", "sample2", "sample3",...]},
                    ],
                },
                {
                    "name": "sample1"
                    "data": [
                        { "type": "vcf", "url": "gs://../file.vcf", "name": "l" },  // * "type" and "label" are optional
                        { "type": "alignment", "url": "gs://../file.vcf", "name": "l" },  // * "type" and "label" are optional
                        
                    ]
                },
            ]
        }
    ]
}
```
