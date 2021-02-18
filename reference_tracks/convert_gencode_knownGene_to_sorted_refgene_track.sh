#!/usr/bin/env bash

echo'

Downloaded Gencode knownGene table from 

https://genome.ucsc.edu/cgi-bin/hgTables?hgsid=1032679709_0cw5CSR3uTIvedjA0A6B8WuAmDXj&clade=mammal&org=Human&db=hg38&hgta_group=genes&hgta_track=knownGene&hgta_table=0&hgta_regionType=genome&position=chrX%3A15%2C560%2C138-15%2C602%2C945&hgta_outputType=bed&hgta_outFileName=hg38_gencode_v32_knownGene.txt.gz

Example row:

$1        #name : ENST00000607096.1
$2        chrom : chr1
$3       strand : +
$4      txStart : 30365
$5        txEnd : 30503
$6     cdsStart : 30365
$7       cdsEnd : 30365
$8    exonCount : 1
$9   exonStarts : 30365,
$10    exonEnds : 30503,
$11   proteinID :
$12     alignID : uc031tlb.1
'

#inputFile=$1
inputFile= gencode_v32_knownGene.txt.gz
prefix=$(echo $inputFile | sed s/.txt// | sed s/.gz//)
bucket="gs://tgg-viewer/ref/GRCh38/gencode_v32"
echo $prefix

cat ./$inputFile  | grep -v chrom | awk -F $'\t' 'BEGIN {OFS=FS} { print $2, $4, $5, gensub(/[.][0-9]/, "", "g", $1), "0", $3, $6, $7, "0,0,255",  $8, $9, $10 }' | grep -v _fix | grep -v _random | grep -v _alt | bedtools sort -g ~/p1/ref/GRCh38/hg38.fa.fai |  bgzip > ${prefix}.bed.gz

gzcat ${prefix}.bed.gz | awk -F $'\t' 'BEGIN {OFS=FS} { print "0", $4, $1, $6, $2, $3, $7, $8, $10, $11, $12, "0", $4 }' | bgzip  > ${prefix}.sorted.txt.gz

tabix -s 3 -b 5 -e 6  ${prefix}.sorted.txt.gz 

gsutil -m cp ${prefix}.sorted.txt.gz* $bucket
echo Wrote ${prefix}.sorted.txt.gz and copied it to ${bucket}/${prefix}.gtf.gz
