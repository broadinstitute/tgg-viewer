#!/usr/bin/env bash

echo '
Downloaded SegDup table from:  (download all fields from selected table)

https://genome.ucsc.edu/cgi-bin/hgTables?hgsid=1032679709_0cw5CSR3uTIvedjA0A6B8WuAmDXj&clade=mammal&org=Human&db=hg38&hgta_group=rep&hgta_track=genomicSuperDups&hgta_table=0&hgta_regionType=genome&position=chrX%3A15%2C560%2C138-15%2C602%2C945&hgta_outputType=primaryTable&hgta_outFileName=hg38_genomicSuperDups.txt


Example row:

$1             #bin : 1
$2            chrom : chr1
$3       chromStart : 16761934
$4         chromEnd : 16799163
$5             name : chr1:234783386
$6            score : 0
$7           strand : -
$8       otherChrom : chr1
$9       otherStart : 234783386
$10        otherEnd : 234820600
$11       otherSize : 37214
$12             uid : 289
$13     posBasesHit : 1000
$14      testResult : N/A
$15         verdict : N/A
$16           chits : N/A
$17            ccov : N/A
$18       alignfile : align_both/0014/both0074763
$19          alignL : 37253
$20          indelN : 29
$21          indelS : 63
$22          alignB : 37190
$23          matchB : 36944
$24       mismatchB : 246
$25    transitionsB : 174
$26  transversionsB : 72
$27       fracMatch : 0.993385
$28  fracMatchIndel : 0.992611
$29             jcK : 0.00664402
$30             k2K : 0.00664869
'


#inputFile=$1
inputFile=hg38_genomicSuperDups.txt
fai=~/p1/ref/GRCh38/hg38.fa.fai
prefix=$(echo $inputFile | sed s/.txt// | sed s/.gz//)

echo Processing $inputFile which has $(cat $inputFile | wc -l) rows ...

cat $inputFile  | grep -v _random | grep -v chrUn_ | grep -v chrom | awk -F $'\t' 'BEGIN {OFS=FS} { 
    print $2, ".", "SegDup", ($3 + 1), $4, ".", $7, ".", "Name " $5 "; Locus " $2 ":" ($3 + 1) "-" $4 "; Size " ($4 - $3) " bp; SequenceSimilarity " $27 "; color " ($27 > 0.99 ? "#E78200": ($27 > 0.98 ? "#D1C800" : "#AAAAAA")) "; "
}' | bedtools sort -g ~/p1/ref/GRCh38/hg38.fa.fai -i - | bgzip > ${prefix}.gtf.gz

tabix ${prefix}.gtf.gz

echo Wrote out ${prefix}.gtf.gz

#gsutil -m cp ${prefix}.gtf.gz* gs://macarthurlab-rnaseq/reference_tracks/



